// Mappers to convert API-Sports responses to internal types

import { Fixture, Team, MatchStatistics, FixtureSummary, MatchDetails } from '@/lib/types';

/**
 * Map API-Sports fixture response to FixtureSummary
 */
export function mapFixtureToSummary(raw: any): FixtureSummary {
  return {
    id: raw.fixture.id,
    date: raw.fixture.date,
    timestamp: raw.fixture.timestamp,
    venue: {
      name: raw.fixture.venue?.name || 'Unknown',
      city: raw.fixture.venue?.city || 'Unknown',
    },
    status: {
      short: raw.fixture.status.short,
      long: raw.fixture.status.long,
      elapsed: raw.fixture.status.elapsed,
    },
    league: {
      id: raw.league.id,
      name: raw.league.name,
      country: raw.league.country,
      logo: raw.league.logo,
      flag: raw.league.flag,
      season: raw.league.season,
      round: raw.league.round,
    },
    teams: {
      home: {
        id: raw.teams.home.id,
        name: raw.teams.home.name,
        logo: raw.teams.home.logo,
      },
      away: {
        id: raw.teams.away.id,
        name: raw.teams.away.name,
        logo: raw.teams.away.logo,
      },
    },
    goals: {
      home: raw.goals.home,
      away: raw.goals.away,
    },
    score: {
      halftime: {
        home: raw.score.halftime?.home || null,
        away: raw.score.halftime?.away || null,
      },
      fulltime: {
        home: raw.score.fulltime?.home || null,
        away: raw.score.fulltime?.away || null,
      },
      extratime: {
        home: raw.score.extratime?.home || null,
        away: raw.score.extratime?.away || null,
      },
      penalty: {
        home: raw.score.penalty?.home || null,
        away: raw.score.penalty?.away || null,
      },
    },
  };
}

/**
 * Map API-Sports fixture response with statistics to MatchDetails
 */
export function mapFixtureToMatchDetails(raw: any): MatchDetails {
  const fixture = mapFixtureToSummary(raw);

  // Parse statistics if available
  let statistics = undefined;
  if (raw.statistics && Array.isArray(raw.statistics) && raw.statistics.length >= 2) {
    const homeStats = raw.statistics[0];
    const awayStats = raw.statistics[1];

    const getStatValue = (stats: any[], type: string): number => {
      const stat = stats.find((s: any) => s.type === type);
      if (!stat || stat.value === null) return 0;
      // Handle percentage strings like "65%"
      if (typeof stat.value === 'string' && stat.value.includes('%')) {
        return parseInt(stat.value.replace('%', ''), 10);
      }
      return typeof stat.value === 'number' ? stat.value : parseInt(stat.value, 10) || 0;
    };

    statistics = {
      home: {
        shotsOnGoal: getStatValue(homeStats.statistics, 'Shots on Goal'),
        shotsOffGoal: getStatValue(homeStats.statistics, 'Shots off Goal'),
        totalShots: getStatValue(homeStats.statistics, 'Total Shots'),
        possession: getStatValue(homeStats.statistics, 'Ball Possession'),
        passes: getStatValue(homeStats.statistics, 'Total passes'),
        passAccuracy: getStatValue(homeStats.statistics, 'Passes accurate'),
        fouls: getStatValue(homeStats.statistics, 'Fouls'),
        yellowCards: getStatValue(homeStats.statistics, 'Yellow Cards'),
        redCards: getStatValue(homeStats.statistics, 'Red Cards'),
        offsides: getStatValue(homeStats.statistics, 'Offsides'),
        corners: getStatValue(homeStats.statistics, 'Corner Kicks'),
      },
      away: {
        shotsOnGoal: getStatValue(awayStats.statistics, 'Shots on Goal'),
        shotsOffGoal: getStatValue(awayStats.statistics, 'Shots off Goal'),
        totalShots: getStatValue(awayStats.statistics, 'Total Shots'),
        possession: getStatValue(awayStats.statistics, 'Ball Possession'),
        passes: getStatValue(awayStats.statistics, 'Total passes'),
        passAccuracy: getStatValue(awayStats.statistics, 'Passes accurate'),
        fouls: getStatValue(awayStats.statistics, 'Fouls'),
        yellowCards: getStatValue(awayStats.statistics, 'Yellow Cards'),
        redCards: getStatValue(awayStats.statistics, 'Red Cards'),
        offsides: getStatValue(awayStats.statistics, 'Offsides'),
        corners: getStatValue(awayStats.statistics, 'Corner Kicks'),
      },
    };
  }

  // Parse h2h if available
  let h2h = undefined;
  if (raw.h2h && Array.isArray(raw.h2h)) {
    h2h = raw.h2h.map((fixture: any) => mapFixtureToSummary(fixture));
  }

  return {
    fixture,
    statistics,
    h2h,
  };
}

// Legacy mappers for backwards compatibility
export function mapApiFixture(apiFixture: any): Fixture {
  return {
    id: apiFixture.fixture.id,
    date: apiFixture.fixture.date,
    homeTeam: {
      id: apiFixture.teams.home.id,
      name: apiFixture.teams.home.name,
      logo: apiFixture.teams.home.logo,
    },
    awayTeam: {
      id: apiFixture.teams.away.id,
      name: apiFixture.teams.away.name,
      logo: apiFixture.teams.away.logo,
    },
    status: apiFixture.fixture.status.short,
    league: {
      id: apiFixture.league.id,
      name: apiFixture.league.name,
      country: apiFixture.league.country,
    },
  };
}

export function mapApiStatistics(apiResponse: any): MatchStatistics {
  const homeStats = apiResponse.response[0];
  const awayStats = apiResponse.response[1];

  return {
    fixtureId: homeStats.fixture.id,
    homeTeam: {
      id: homeStats.team.id,
      name: homeStats.team.name,
      logo: homeStats.team.logo,
    },
    awayTeam: {
      id: awayStats.team.id,
      name: awayStats.team.name,
      logo: awayStats.team.logo,
    },
    statistics: {
      home: homeStats.statistics,
      away: awayStats.statistics,
    },
  };
}

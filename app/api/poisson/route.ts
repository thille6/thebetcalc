import { NextRequest, NextResponse } from 'next/server';
import { apiSportsGet } from '@/lib/apisports/client';
import { mapFixtureToSummary } from '@/lib/apisports/map';
import { ApiResponse, FixtureSummary, PoissonResponse, ErrorShape } from '@/lib/types';
import { computeOutcomeProbs, computeLambdasFromMatches } from '@/lib/poisson/poisson';
import cache from '@/lib/cache/memoryCache';

export const runtime = 'nodejs';

const HISTORY_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface PoissonRequestBody {
  fixtureId: number;
  window: number;
  useHomeAwaySplit: boolean;
}

/**
 * POST /api/poisson
 * Calculate Poisson prediction for a match
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: PoissonRequestBody;
    try {
      body = await request.json();
    } catch {
      const error: ErrorShape = {
        error: 'BAD_INPUT',
        message: 'Invalid JSON in request body',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const { fixtureId, window, useHomeAwaySplit } = body;

    // Validate inputs
    if (!fixtureId || typeof fixtureId !== 'number' || fixtureId <= 0) {
      const error: ErrorShape = {
        error: 'BAD_INPUT',
        message: 'fixtureId must be a positive number',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    if (!window || typeof window !== 'number' || window < 3 || window > 50) {
      const error: ErrorShape = {
        error: 'BAD_INPUT',
        message: 'window must be a number between 3 and 50',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    if (typeof useHomeAwaySplit !== 'boolean') {
      const error: ErrorShape = {
        error: 'BAD_INPUT',
        message: 'useHomeAwaySplit must be a boolean',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // Check if API key is set
    if (!process.env.APISPORTS_API_KEY) {
      const error: ErrorShape = {
        error: 'MISSING_API_KEY',
        message: 'API-Sports API key is not configured',
        code: 'CONFIGURATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    // Fetch match details
    let matchResponse: ApiResponse<any[]>;
    try {
      matchResponse = await apiSportsGet<ApiResponse<any[]>>('/fixtures', {
        id: fixtureId,
      });
    } catch (error: any) {
      const errorResponse: ErrorShape = {
        error: 'APISPORTS_ERROR',
        message: `Failed to fetch match details: ${error.message}`,
        code: 'API_ERROR',
      };
      return NextResponse.json({ ok: false, error: errorResponse }, { status: 500 });
    }

    if (!matchResponse.response || matchResponse.response.length === 0) {
      const error: ErrorShape = {
        error: 'BAD_INPUT',
        message: `No fixture found with ID ${fixtureId}`,
        code: 'NOT_FOUND',
      };
      return NextResponse.json({ ok: false, error }, { status: 404 });
    }

    const fixture = mapFixtureToSummary(matchResponse.response[0]);
    const homeTeamId = fixture.teams.home.id;
    const awayTeamId = fixture.teams.away.id;
    const leagueId = fixture.league.id;
    const season = fixture.league.season;

    // Fetch historical matches for both teams
    const fetchTeamHistory = async (teamId: number): Promise<FixtureSummary[]> => {
      const cacheKey = `history:${teamId}:${leagueId}:${season}:${window}`;

      // Check cache
      const cached = cache.get<FixtureSummary[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from API
      try {
        const response = await apiSportsGet<ApiResponse<any[]>>('/fixtures', {
          team: teamId,
          league: leagueId,
          season: season,
          last: window,
        });

        const fixtures = response.response.map((raw: any) => mapFixtureToSummary(raw));

        // Cache the result
        cache.set(cacheKey, fixtures, HISTORY_CACHE_TTL_MS);

        return fixtures;
      } catch (error: any) {
        throw new Error(`Failed to fetch history for team ${teamId}: ${error.message}`);
      }
    };

    let homeHistory: FixtureSummary[];
    let awayHistory: FixtureSummary[];

    try {
      [homeHistory, awayHistory] = await Promise.all([
        fetchTeamHistory(homeTeamId),
        fetchTeamHistory(awayTeamId),
      ]);
    } catch (error: any) {
      const errorResponse: ErrorShape = {
        error: 'APISPORTS_ERROR',
        message: error.message,
        code: 'API_ERROR',
      };
      return NextResponse.json({ ok: false, error: errorResponse }, { status: 500 });
    }

    // Calculate lambdas
    let lambdaHome: number;
    let lambdaAway: number;

    try {
      if (useHomeAwaySplit) {
        // Home team: only home matches, Away team: only away matches
        lambdaHome = computeLambdasFromMatches(homeHistory, homeTeamId, 'HOME_ONLY');
        lambdaAway = computeLambdasFromMatches(awayHistory, awayTeamId, 'AWAY_ONLY');
      } else {
        // Use all matches for both teams
        lambdaHome = computeLambdasFromMatches(homeHistory, homeTeamId, 'ALL');
        lambdaAway = computeLambdasFromMatches(awayHistory, awayTeamId, 'ALL');
      }
    } catch (error: any) {
      const errorResponse: ErrorShape = {
        error: 'INSUFFICIENT_DATA',
        message: error.message || 'Not enough historical data to calculate prediction',
        code: 'INSUFFICIENT_DATA',
      };
      return NextResponse.json({ ok: false, error: errorResponse }, { status: 400 });
    }

    // Compute outcome probabilities
    const probs = computeOutcomeProbs(lambdaHome, lambdaAway, 6);

    // Find most likely score
    let mostLikelyScore = { home: 0, away: 0, probability: 0 };

    for (let h = 0; h <= 6; h++) {
      for (let a = 0; a <= 6; a++) {
        const homeProb = (Math.exp(-lambdaHome) * Math.pow(lambdaHome, h)) / factorial(h);
        const awayProb = (Math.exp(-lambdaAway) * Math.pow(lambdaAway, a)) / factorial(a);
        const prob = homeProb * awayProb;

        if (prob > mostLikelyScore.probability) {
          mostLikelyScore = { home: h, away: a, probability: prob };
        }
      }
    }

    // Build response
    const response: PoissonResponse = {
      prediction: {
        homeWin: probs.pHomeWin,
        draw: probs.pDraw,
        awayWin: probs.pAwayWin,
      },
      expectedGoals: {
        home: lambdaHome,
        away: lambdaAway,
      },
      overUnder: {
        over15: probs.pOver15,
        over25: probs.pOver25,
      },
      scoreMatrix: [], // Not included for performance
      mostLikelyScore,
    };

    return NextResponse.json({
      ok: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Error calculating Poisson prediction:', error);

    const errorResponse: ErrorShape = {
      error: 'INTERNAL_ERROR',
      message: error.message || 'Failed to calculate prediction',
      code: 'API_ERROR',
    };

    return NextResponse.json({ ok: false, error: errorResponse }, { status: 500 });
  }
}

// Helper function for factorial
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

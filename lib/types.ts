// Core types for the application

export interface Team {
  id: number;
  name: string;
  logo?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  response: T;
  results?: number;
  paging?: {
    current: number;
    total: number;
  };
  errors?: Record<string, string>;
}

// Error shape for API responses
export interface ErrorShape {
  error: string;
  message?: string;
  code?: string;
}

// Fixture Summary (simplified fixture data)
export interface FixtureSummary {
  id: number;
  date: string;
  timestamp: number;
  venue: {
    name: string;
    city: string;
  };
  status: {
    short: string;
    long: string;
    elapsed: number | null;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

// Match Details (extended fixture data with statistics)
export interface MatchDetails {
  fixture: FixtureSummary;
  statistics?: {
    home: {
      shotsOnGoal: number;
      shotsOffGoal: number;
      totalShots: number;
      possession: number;
      passes: number;
      passAccuracy: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
      corners: number;
    };
    away: {
      shotsOnGoal: number;
      shotsOffGoal: number;
      totalShots: number;
      possession: number;
      passes: number;
      passAccuracy: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
      corners: number;
    };
  };
  h2h?: FixtureSummary[];
}

// Poisson Request
export interface PoissonRequest {
  homeTeamId: number;
  awayTeamId: number;
  leagueId: number;
  season: number;
}

// Poisson Response
export interface PoissonResponse {
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  expectedGoals: {
    home: number;
    away: number;
  };
  overUnder?: {
    over15: number;
    over25: number;
  };
  scoreMatrix: number[][];
  mostLikelyScore: {
    home: number;
    away: number;
    probability: number;
  };
}

export interface Fixture {
  id: number;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  status: string;
  league: {
    id: number;
    name: string;
    country: string;
  };
}

export interface MatchStatistics {
  fixtureId: number;
  homeTeam: Team;
  awayTeam: Team;
  statistics: {
    home: Record<string, any>;
    away: Record<string, any>;
  };
}

export interface PoissonPrediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  expectedGoals: {
    home: number;
    away: number;
  };
  scoreMatrix?: number[][];
}

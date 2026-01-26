import { describe, it, expect } from 'vitest';
import {
  poissonPmf,
  computeOutcomeProbs,
  computeLambdasFromMatches,
  type LambdaMode,
} from './poisson';
import { FixtureSummary } from '@/lib/types';

describe('poissonPmf', () => {
  it('should calculate basic Poisson probabilities correctly', () => {
    // P(k=0; λ=2) = e^-2 ≈ 0.1353
    expect(poissonPmf(2, 0)).toBeCloseTo(0.1353, 3);

    // P(k=1; λ=2) = 2 * e^-2 ≈ 0.2707
    expect(poissonPmf(2, 1)).toBeCloseTo(0.2707, 3);

    // P(k=2; λ=2) = 2 * e^-2 ≈ 0.2707
    expect(poissonPmf(2, 2)).toBeCloseTo(0.2707, 3);
  });

  it('should return 0 for negative k', () => {
    expect(poissonPmf(2, -1)).toBe(0);
  });

  it('should handle lambda=0 edge case', () => {
    expect(poissonPmf(0, 0)).toBe(1);
    expect(poissonPmf(0, 1)).toBe(0);
  });
});

describe('computeOutcomeProbs', () => {
  it('should give symmetric probabilities when lambdas are equal', () => {
    const result = computeOutcomeProbs(1.5, 1.5, 6);

    // With equal lambdas, home win and away win should be approximately equal
    expect(Math.abs(result.pHomeWin - result.pAwayWin)).toBeLessThan(0.001);

    // Draw probability should be significant but less than win probabilities
    expect(result.pDraw).toBeGreaterThan(0.2);
    expect(result.pDraw).toBeLessThan(0.3);

    // Probabilities should sum to approximately 1
    const total = result.pHomeWin + result.pDraw + result.pAwayWin;
    expect(total).toBeCloseTo(1, 2);
  });

  it('should give higher pHomeWin when lambdaHome is higher', () => {
    const result = computeOutcomeProbs(2.5, 1.0, 6);

    // Home team with higher expected goals should have higher win probability
    expect(result.pHomeWin).toBeGreaterThan(result.pAwayWin);
    expect(result.pHomeWin).toBeGreaterThan(0.5);
    expect(result.pAwayWin).toBeLessThan(0.2);
  });

  it('should give high Under (low Over) probabilities when lambdas are near 0', () => {
    const result = computeOutcomeProbs(0.3, 0.3, 6);

    // With very low expected goals, Over 1.5 should be low
    expect(result.pOver15).toBeLessThan(0.2);

    // Over 2.5 should be even lower
    expect(result.pOver25).toBeLessThan(0.1);

    // Most matches should end 0-0, 1-0, or 0-1
    expect(result.pDraw).toBeGreaterThan(0.5);
  });

  it('should give high Over probabilities when lambdas are high', () => {
    const result = computeOutcomeProbs(2.5, 2.5, 6);

    // With high expected goals, Over 1.5 should be very likely
    expect(result.pOver15).toBeGreaterThan(0.85);

    // Over 2.5 should also be likely
    expect(result.pOver25).toBeGreaterThan(0.65);
  });
});

describe('computeLambdasFromMatches', () => {
  // Helper to create fixture summary
  const createFixture = (
    homeId: number,
    awayId: number,
    homeGoals: number,
    awayGoals: number
  ): FixtureSummary => ({
    id: Math.random(),
    date: '2024-01-01T00:00:00Z',
    timestamp: Date.now(),
    venue: { name: 'Stadium', city: 'City' },
    status: { short: 'FT', long: 'Finished', elapsed: 90 },
    league: {
      id: 1,
      name: 'League',
      country: 'Country',
      logo: '',
      flag: '',
      season: 2024,
      round: 'Round 1',
    },
    teams: {
      home: { id: homeId, name: `Team ${homeId}` },
      away: { id: awayId, name: `Team ${awayId}` },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  });

  it('should calculate lambda from home matches only', () => {
    const matches = [
      createFixture(1, 2, 2, 1), // Team 1 home: 2 goals
      createFixture(1, 3, 3, 0), // Team 1 home: 3 goals
      createFixture(1, 4, 1, 1), // Team 1 home: 1 goal
    ];

    const lambda = computeLambdasFromMatches(matches, 1, 'HOME_ONLY');
    expect(lambda).toBe(2); // (2 + 3 + 1) / 3 = 2
  });

  it('should calculate lambda from away matches only', () => {
    const matches = [
      createFixture(2, 1, 0, 2), // Team 1 away: 2 goals
      createFixture(3, 1, 1, 1), // Team 1 away: 1 goal
      createFixture(4, 1, 0, 3), // Team 1 away: 3 goals
    ];

    const lambda = computeLambdasFromMatches(matches, 1, 'AWAY_ONLY');
    expect(lambda).toBe(2); // (2 + 1 + 3) / 3 = 2
  });

  it('should calculate lambda from all matches', () => {
    const matches = [
      createFixture(1, 2, 2, 1), // Team 1 home: 2 goals
      createFixture(3, 1, 0, 3), // Team 1 away: 3 goals
      createFixture(1, 4, 1, 1), // Team 1 home: 1 goal
      createFixture(5, 1, 2, 2), // Team 1 away: 2 goals
    ];

    const lambda = computeLambdasFromMatches(matches, 1, 'ALL');
    expect(lambda).toBe(2); // (2 + 3 + 1 + 2) / 4 = 2
  });

  it('should throw INSUFFICIENT_DATA error with less than 3 matches', () => {
    const matches = [createFixture(1, 2, 2, 1), createFixture(1, 3, 3, 0)];

    expect(() => computeLambdasFromMatches(matches, 1, 'HOME_ONLY')).toThrow('INSUFFICIENT_DATA');
  });

  it('should throw INSUFFICIENT_DATA error with less than 3 finished matches', () => {
    const matches = [
      createFixture(1, 2, 2, 1),
      createFixture(1, 3, 3, 0),
      {
        ...createFixture(1, 4, 0, 0),
        status: { short: 'NS', long: 'Not Started', elapsed: null },
      },
    ];

    expect(() => computeLambdasFromMatches(matches, 1, 'HOME_ONLY')).toThrow('INSUFFICIENT_DATA');
  });

  it('should ignore non-finished matches', () => {
    const matches = [
      createFixture(1, 2, 2, 1), // FT
      createFixture(1, 3, 3, 0), // FT
      createFixture(1, 4, 1, 1), // FT
      {
        ...createFixture(1, 5, 5, 5),
        status: { short: 'LIVE', long: 'In Progress', elapsed: 45 },
      },
    ];

    const lambda = computeLambdasFromMatches(matches, 1, 'HOME_ONLY');
    expect(lambda).toBe(2); // Only counts FT matches: (2 + 3 + 1) / 3 = 2
  });
});

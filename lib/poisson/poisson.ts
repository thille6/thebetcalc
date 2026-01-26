// Poisson distribution calculations for football predictions

import { PoissonPrediction, FixtureSummary } from '@/lib/types';

/**
 * Poisson Probability Mass Function (PMF)
 * P(k; λ) = (e^-λ * λ^k) / k!
 *
 * @param lambda - Expected value (mean number of events)
 * @param k - Number of occurrences
 * @returns Probability of exactly k occurrences
 */
export function poissonPmf(lambda: number, k: number): number {
  if (k < 0) return 0;
  if (lambda <= 0) return k === 0 ? 1 : 0;

  // Use iterative calculation to avoid overflow with large factorials
  let probability = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    probability *= lambda / i;
  }

  return probability;
}

/**
 * Outcome probabilities for a match
 */
export interface OutcomeProbs {
  pHomeWin: number;
  pDraw: number;
  pAwayWin: number;
  pOver15: number; // Over 1.5 goals
  pOver25: number; // Over 2.5 goals
}

/**
 * Compute match outcome probabilities using Poisson distribution
 *
 * @param lambdaHome - Expected goals for home team
 * @param lambdaAway - Expected goals for away team
 * @param maxGoals - Maximum goals to consider (default: 6)
 * @returns Outcome probabilities
 */
export function computeOutcomeProbs(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number = 6
): OutcomeProbs {
  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;
  let pOver15 = 0;
  let pOver25 = 0;

  // Calculate probability matrix for all score combinations
  for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals++) {
      const homeProb = poissonPmf(lambdaHome, homeGoals);
      const awayProb = poissonPmf(lambdaAway, awayGoals);
      const prob = homeProb * awayProb;

      // Match outcome
      if (homeGoals > awayGoals) {
        pHomeWin += prob;
      } else if (homeGoals === awayGoals) {
        pDraw += prob;
      } else {
        pAwayWin += prob;
      }

      // Total goals
      const totalGoals = homeGoals + awayGoals;
      if (totalGoals > 1.5) {
        pOver15 += prob;
      }
      if (totalGoals > 2.5) {
        pOver25 += prob;
      }
    }
  }

  return {
    pHomeWin,
    pDraw,
    pAwayWin,
    pOver15,
    pOver25,
  };
}

/**
 * Mode for lambda calculation
 */
export type LambdaMode = 'HOME_ONLY' | 'AWAY_ONLY' | 'ALL';

/**
 * Compute lambda (expected goals) from historical matches
 *
 * @param matches - Array of historical fixtures
 * @param teamId - Team ID to calculate lambda for
 * @param mode - Filter mode: HOME_ONLY, AWAY_ONLY, or ALL
 * @returns Average goals scored per match
 * @throws Error if insufficient data (<3 matches)
 */
export function computeLambdasFromMatches(
  matches: FixtureSummary[],
  teamId: number,
  mode: LambdaMode
): number {
  // Filter matches based on mode
  let filteredMatches = matches;

  if (mode === 'HOME_ONLY') {
    filteredMatches = matches.filter((m) => m.teams.home.id === teamId);
  } else if (mode === 'AWAY_ONLY') {
    filteredMatches = matches.filter((m) => m.teams.away.id === teamId);
  } else {
    // ALL mode - filter matches where team is either home or away
    filteredMatches = matches.filter(
      (m) => m.teams.home.id === teamId || m.teams.away.id === teamId
    );
  }

  // Check for insufficient data
  if (filteredMatches.length < 3) {
    throw new Error(`INSUFFICIENT_DATA: Need at least 3 matches, got ${filteredMatches.length}`);
  }

  // Calculate total goals scored
  let totalGoals = 0;
  let matchCount = 0;

  for (const match of filteredMatches) {
    // Only count finished matches with valid scores
    if (match.status.short === 'FT' && match.goals.home !== null && match.goals.away !== null) {
      if (match.teams.home.id === teamId) {
        totalGoals += match.goals.home;
      } else {
        totalGoals += match.goals.away;
      }
      matchCount++;
    }
  }

  // Check if we have enough finished matches
  if (matchCount < 3) {
    throw new Error(`INSUFFICIENT_DATA: Need at least 3 finished matches, got ${matchCount}`);
  }

  // Return average goals per match (lambda)
  return totalGoals / matchCount;
}

// Legacy function for backwards compatibility
function poissonProbability(lambda: number, k: number): number {
  return poissonPmf(lambda, k);
}

/**
 * Calculate factorial
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Calculate Poisson prediction for a match
 */
export function calculatePoissonPrediction(
  homeExpectedGoals: number,
  awayExpectedGoals: number,
  maxGoals: number = 10
): PoissonPrediction {
  // Calculate score probability matrix
  const scoreMatrix: number[][] = [];

  for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals++) {
    scoreMatrix[homeGoals] = [];
    for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals++) {
      const homeProb = poissonProbability(homeExpectedGoals, homeGoals);
      const awayProb = poissonProbability(awayExpectedGoals, awayGoals);
      scoreMatrix[homeGoals][awayGoals] = homeProb * awayProb;
    }
  }

  // Calculate match outcome probabilities
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals++) {
      const prob = scoreMatrix[homeGoals][awayGoals];

      if (homeGoals > awayGoals) {
        homeWin += prob;
      } else if (homeGoals === awayGoals) {
        draw += prob;
      } else {
        awayWin += prob;
      }
    }
  }

  return {
    homeWin,
    draw,
    awayWin,
    expectedGoals: {
      home: homeExpectedGoals,
      away: awayExpectedGoals,
    },
    scoreMatrix,
  };
}

/**
 * Calculate expected goals based on team statistics
 * This is a simplified version - you may want to use more sophisticated models
 */
export function calculateExpectedGoals(
  teamAttackStrength: number,
  opponentDefenseStrength: number,
  leagueAverageGoals: number = 2.5
): number {
  return teamAttackStrength * opponentDefenseStrength * leagueAverageGoals;
}

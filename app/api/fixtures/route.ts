import { NextRequest, NextResponse } from 'next/server';
import { apiSportsGet } from '@/lib/apisports/client';
import { mapFixtureToSummary } from '@/lib/apisports/map';
import { ApiResponse, FixtureSummary, ErrorShape } from '@/lib/types';
import cache from '@/lib/cache/memoryCache';

export const runtime = 'nodejs';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate season format (4-digit year)
 */
function isValidSeason(season: string): boolean {
  const regex = /^\d{4}$/;
  return regex.test(season);
}

/**
 * GET /api/fixtures
 * Query params: date (YYYY-MM-DD), leagueId (number), season (YYYY)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const leagueId = searchParams.get('leagueId');
    const season = searchParams.get('season');

    // Validate required parameters
    if (!date || !leagueId || !season) {
      const error: ErrorShape = {
        error: 'MISSING_PARAMETERS',
        message: 'Required parameters: date (YYYY-MM-DD), leagueId, season (YYYY)',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // Validate date format
    if (!isValidDate(date)) {
      const error: ErrorShape = {
        error: 'INVALID_DATE',
        message: 'Date must be in YYYY-MM-DD format',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // Validate season format
    if (!isValidSeason(season)) {
      const error: ErrorShape = {
        error: 'INVALID_SEASON',
        message: 'Season must be a 4-digit year (e.g., 2024)',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // Validate leagueId is a number
    const leagueIdNum = parseInt(leagueId, 10);
    if (isNaN(leagueIdNum)) {
      const error: ErrorShape = {
        error: 'INVALID_LEAGUE_ID',
        message: 'League ID must be a valid number',
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

    // Generate cache key
    const cacheKey = `fixtures:${date}:${leagueId}:${season}`;

    // Check cache first
    const cachedData = cache.get<FixtureSummary[]>(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        ok: true,
        data: cachedData,
        cached: true,
      });
    }

    // Fetch from API-Sports
    const response = await apiSportsGet<ApiResponse<any[]>>('/fixtures', {
      date,
      league: leagueIdNum,
      season: parseInt(season, 10),
    });

    // Normalize to FixtureSummary[]
    const fixtures: FixtureSummary[] = response.response.map((raw: any) =>
      mapFixtureToSummary(raw)
    );

    // Cache the result
    cache.set(cacheKey, fixtures, CACHE_TTL_MS);

    return NextResponse.json({
      ok: true,
      data: fixtures,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching fixtures:', error);

    const errorResponse: ErrorShape = {
      error: 'INTERNAL_ERROR',
      message: error.message || 'Failed to fetch fixtures',
      code: 'API_ERROR',
    };

    return NextResponse.json({ ok: false, error: errorResponse }, { status: 500 });
  }
}

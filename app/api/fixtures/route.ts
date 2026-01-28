import { NextRequest, NextResponse } from 'next/server';
import { footballDataGet } from '@/lib/apisports/client';
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
 * GET /api/fixtures
 * Query params: date (YYYY-MM-DD), leagueId (competition code like 'PL', 'CL', etc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const leagueId = searchParams.get('leagueId');

    // Validate required parameters
    if (!date) {
      const error: ErrorShape = {
        error: 'MISSING_PARAMETERS',
        message: 'Required parameter: date (YYYY-MM-DD)',
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

    // Check if API key is set
    if (!process.env.FOOTBALL_DATA_API_KEY) {
      const error: ErrorShape = {
        error: 'MISSING_API_KEY',
        message: 'Football-Data API key is not configured',
        code: 'CONFIGURATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    // Generate cache key
    const cacheKey = `fixtures:${date}:${leagueId || 'all'}`;

    // Check cache first
    const cachedData = cache.get<FixtureSummary[]>(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        ok: true,
        data: cachedData,
        cached: true,
      });
    }

    // Build query parameters
    const params: Record<string, string> = {
      dateFrom: date,
      dateTo: date,
    };
    
    if (leagueId) {
      params.competitions = leagueId;
    }

    // Fetch from Football-Data API
    const response = await footballDataGet<any>('/matches', params);

    // Map to FixtureSummary format
    const fixtures: FixtureSummary[] = (response.matches || []).map((match: any) => ({
      id: match.id,
      date: match.utcDate,
      teams: {
        home: { name: match.homeTeam.name },
        away: { name: match.awayTeam.name },
      },
      status: {
        short: match.status === 'FINISHED' ? 'FT' : match.status === 'IN_PLAY' ? 'LIVE' : 'NS',
        long: match.status,
      },
      score: match.score?.fullTime ? {
        home: match.score.fullTime.home,
        away: match.score.fullTime.away,
      } : undefined,
    }));

    // Cache the result
    cache.set(cacheKey, fixtures, CACHE_TTL_MS);

    return NextResponse.json({
      ok: true,
      data: fixtures,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching fixtures:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      apiKeySet: !!process.env.FOOTBALL_DATA_API_KEY,
      apiKeyLength: process.env.FOOTBALL_DATA_API_KEY?.length || 0,
    });

    const errorResponse: ErrorShape = {
      error: 'INTERNAL_ERROR',
      message: error.message || 'Failed to fetch fixtures',
      code: 'API_ERROR',
    };

    return NextResponse.json({ ok: false, error: errorResponse }, { status: 500 });
  }
}

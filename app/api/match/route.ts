import { NextRequest, NextResponse } from 'next/server';
import { apiSportsGet } from '@/lib/apisports/client';
import { mapFixtureToMatchDetails } from '@/lib/apisports/map';
import { ApiResponse, MatchDetails, ErrorShape } from '@/lib/types';
import cache from '@/lib/cache/memoryCache';

export const runtime = 'nodejs';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/match
 * Query params: fixtureId (number)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fixtureId = searchParams.get('fixtureId');

    // Validate required parameter
    if (!fixtureId) {
      const error: ErrorShape = {
        error: 'MISSING_PARAMETER',
        message: 'Required parameter: fixtureId',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // Validate fixtureId is a number
    const fixtureIdNum = parseInt(fixtureId, 10);
    if (isNaN(fixtureIdNum) || fixtureIdNum <= 0) {
      const error: ErrorShape = {
        error: 'INVALID_FIXTURE_ID',
        message: 'Fixture ID must be a valid positive number',
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
    const cacheKey = `match:${fixtureIdNum}`;

    // Check cache first
    const cachedData = cache.get<MatchDetails>(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        ok: true,
        data: cachedData,
        cached: true,
      });
    }

    // Fetch from API-Sports
    const response = await apiSportsGet<ApiResponse<any[]>>('/fixtures', {
      id: fixtureIdNum,
    });

    // Check if fixture was found
    if (!response.response || response.response.length === 0) {
      const error: ErrorShape = {
        error: 'FIXTURE_NOT_FOUND',
        message: `No fixture found with ID ${fixtureIdNum}`,
        code: 'NOT_FOUND',
      };
      return NextResponse.json({ ok: false, error }, { status: 404 });
    }

    // Normalize first result to MatchDetails
    const matchDetails: MatchDetails = mapFixtureToMatchDetails(response.response[0]);

    // Cache the result
    cache.set(cacheKey, matchDetails, CACHE_TTL_MS);

    return NextResponse.json({
      ok: true,
      data: matchDetails,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching match data:', error);

    const errorResponse: ErrorShape = {
      error: 'INTERNAL_ERROR',
      message: error.message || 'Failed to fetch match data',
      code: 'API_ERROR',
    };

    return NextResponse.json({ ok: false, error: errorResponse }, { status: 500 });
  }
}

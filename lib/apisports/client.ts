// Football-Data.org client for making requests to the API

const API_BASE_URL = 'https://api.football-data.org/v4';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

// Get API key and fail fast if not set
function getApiKey(): string {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    throw new Error(
      'FOOTBALL_DATA_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file. ' +
        'Get your API key from https://www.football-data.org/client/register'
    );
  }

  return apiKey;
}

/**
 * Main Football-Data API fetch wrapper
 * @param path - API endpoint path (e.g., '/matches')
 * @param params - Query parameters as key-value pairs
 * @returns JSON response from Football-Data API
 */
export async function footballDataGet<T = any>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  // Filter out undefined values and build query string
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      filteredParams[key] = String(value);
    }
  }

  const queryString = new URLSearchParams(filteredParams).toString();
  const url = queryString ? `${API_BASE_URL}${path}?${queryString}` : `${API_BASE_URL}${path}`;

  // Create an AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': getApiKey(),
      },
      signal: controller.signal,
      cache: 'no-store', // Disable Next.js cache
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Football-Data API HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        url,
      });
      throw new Error(`Football-Data API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Football-Data API request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }

    throw error;
  }
}

// Legacy export for backwards compatibility
export function getFootballDataClient() {
  return {
    get: footballDataGet,
  };
}

// Keep old name for backwards compatibility
export const apiSportsGet = footballDataGet;

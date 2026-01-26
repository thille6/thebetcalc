// API-Football client for making requests to the API-Sports service

const API_BASE_URL = 'https://v3.football.api-sports.io';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

// Get API key and fail fast if not set
function getApiKey(): string {
  const apiKey = process.env.APISPORTS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'APISPORTS_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file. ' +
        'Get your API key from https://www.api-football.com/'
    );
  }

  return apiKey;
}

/**
 * Main API-Sports fetch wrapper
 * @param path - API endpoint path (e.g., '/fixtures')
 * @param params - Query parameters as key-value pairs
 * @returns JSON response from API-Sports
 */
export async function apiSportsGet<T = any>(
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
        'x-apisports-key': getApiKey(),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API-Sports request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API errors in response
    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(`API-Sports returned errors: ${JSON.stringify(data.errors)}`);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`API-Sports request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }

    throw error;
  }
}

// Legacy export for backwards compatibility
export function getApiSportsClient() {
  return {
    get: apiSportsGet,
  };
}

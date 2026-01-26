# Project Noah

A Next.js application for football match predictions using Poisson distribution and API-Sports data.

## 📖 Project Description

Project Noah is a statistical football prediction application that uses the Poisson distribution model to predict match outcomes. It fetches real-time football data from API-Sports and calculates probabilities for various match outcomes including:

- Match result (Home Win / Draw / Away Win)
- Expected goals for each team
- Over/Under goals predictions
- Most likely score

The application features a clean web interface where users can browse fixtures and get instant predictions based on historical performance data.

## ✨ Features

- **Live Fixture Data**: Fetch matches by date, league, and season
- **Detailed Match Statistics**: View comprehensive match and team statistics
- **Poisson Predictions**: Statistical predictions based on historical data
- **Configurable Analysis**: Choose number of recent matches and home/away split
- **Smart Caching**: Efficient data caching to minimize API calls
- **Clean UI**: Intuitive interface for browsing and analyzing matches

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm package manager
- API-Sports API key from [api-football.com](https://www.api-football.com/)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd "Project Noah"
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your API-Sports key:

```env
# API-Sports API Key
# Get your key from https://www.api-football.com/
APISPORTS_API_KEY=your_actual_api_key_here
```

⚠️ **Important**: Never commit your `.env.local` file or expose your API key in the code.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Quality Tools

### Running Tests

```bash
# Run tests once
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Formatting

We use Prettier for consistent code formatting:

```bash
# Format all files
npm run format

# Check if files are formatted
npm run format:check
```

### Linting

ESLint checks for code quality issues:

```bash
npm run lint
```

### Type Checking

Verify TypeScript types without building:

```bash
npm run typecheck
```

### Pre-commit Recommendations

To maintain code quality, run these commands before committing:

```bash
npm run format     # Format code
npm run lint       # Check for linting errors
npm run typecheck  # Verify TypeScript types
npm test           # Run tests
```

**Optional: Automated Pre-commit Hooks**

For automatic quality checks before commits, consider setting up [Husky](https://typicode.github.io/husky/) with [lint-staged](https://github.com/okonet/lint-staged):

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## Continuous Integration

The project includes a GitHub Actions CI workflow that automatically runs on every push and pull request to the `main` branch.

### CI Pipeline

The workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) performs:

1. **Linting**: Code quality checks with ESLint
2. **Type Checking**: TypeScript validation
3. **Testing**: All unit tests with Vitest
4. **Building**: Production build verification

### Running Locally

You can simulate the CI pipeline locally:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### Notes

- CI runs on Node.js 20 with npm caching enabled
- Tests and build work without the `APISPORTS_API_KEY` (no external API calls during CI)
- All quality checks must pass before merging PRs

### Building for Production

```bash
npm run build
npm start
```

## Production Deployment

This Next.js application can be deployed to any hosting platform that supports Node.js runtime. Below are step-by-step instructions for popular hosting providers.

### Prerequisites

- GitHub repository with your code
- API-Sports API key from [api-football.com](https://www.api-football.com/)

### Deployment Steps

#### 1. Choose a Hosting Platform

Recommended platforms that support Node.js:

- **Vercel** (recommended for Next.js, zero config)
- **Railway** (easy deployment with Git integration)
- **Render** (free tier available)
- **Fly.io** (global edge deployment)
- **DigitalOcean App Platform**

#### 2. Connect Your Repository

**For Vercel:**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your repository
4. Vercel auto-detects Next.js settings

**For Railway:**

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

**For Render:**

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New Web Service"
3. Connect your repository

#### 3. Configure Build Settings

Most platforms auto-detect these, but verify:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher
- **Install Command**: `npm ci` (or `npm install`)

#### 4. Set Environment Variables

In your platform's settings, add the following environment variable:

| Variable            | Value               | Required |
| ------------------- | ------------------- | -------- |
| `APISPORTS_API_KEY` | Your API-Sports key | Yes      |

**Platform-specific instructions:**

- **Vercel**: Project Settings → Environment Variables
- **Railway**: Service → Variables tab
- **Render**: Environment tab → Add Environment Variable

#### 5. Deploy

After connecting and configuring:

- Most platforms deploy automatically on push to main
- Manual deploy: Use the platform's "Deploy" button
- Check deployment logs for any errors

#### 6. Verify Deployment

Test the following endpoints:

```bash
# Health check (should work immediately)
curl https://your-app.domain/api/health

# Fixtures (requires valid API key)
curl "https://your-app.domain/api/fixtures?date=2024-01-15&leagueId=39&season=2024"
```

### Important Configuration Notes

1. **Runtime**: All API routes use Node.js runtime (`export const runtime = 'nodejs'`), not Edge runtime. This is required for the API-Sports integration.

2. **Build Without API Key**: The build process (`npm run build`) does NOT require the `APISPORTS_API_KEY` environment variable. The key is only needed at runtime for API calls.

3. **Cache Behavior**: The in-memory cache is best-effort and will reset on:
   - Server restarts
   - Platform cold starts
   - Scaling events (multiple instances)

4. **Missing API Key Handling**: If `APISPORTS_API_KEY` is not set, API endpoints return:
   ```json
   {
     "ok": false,
     "error": {
       "error": "MISSING_API_KEY",
       "message": "API-Sports API key is not configured",
       "code": "CONFIGURATION_ERROR"
     }
   }
   ```
   Status: `500 Internal Server Error`

### Production Best Practices

1. **Rate Limiting**: Consider adding rate limiting to `/api/poisson` endpoint to prevent abuse:
   - Use packages like `express-rate-limit` or implement custom middleware
   - Recommended: 10 requests per minute per IP

2. **Monitoring**: Set up monitoring for:
   - API response times
   - Error rates
   - API-Sports quota usage
   - Cache hit rates

3. **Logging**: Enable structured logging in production:

   ```typescript
   console.log(
     JSON.stringify({
       level: 'info',
       timestamp: new Date().toISOString(),
       message: 'API call',
       endpoint: '/api/fixtures',
     })
   );
   ```

4. **Error Tracking**: Consider integrating:
   - Sentry for error tracking
   - LogRocket for session replay
   - DataDog for APM

5. **Security Headers**: Add security headers (most platforms handle this automatically):
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: max-age=31536000`

### Troubleshooting Deployment

**Build Fails:**

- Verify Node.js version is 18 or higher
- Check build logs for TypeScript errors
- Run `npm run build` locally to reproduce

**500 Errors After Deploy:**

- Verify `APISPORTS_API_KEY` is set in environment variables
- Check application logs for specific error messages
- Test the health endpoint: `/api/health`

**Slow Response Times:**

- Enable caching on your hosting platform
- Consider upgrading to a paid tier with better performance
- Check API-Sports response times

**Cache Not Working:**

- In-memory cache resets on restart/cold start
- Consider using Redis for persistent caching
- Check if platform uses multiple instances (shared cache needed)

## Project Structure

```
/app
  /api
    /fixtures      - API route for fetching fixtures
    /match         - API route for match data
    /poisson       - API route for Poisson predictions
  page.tsx         - Home page
  layout.tsx       - Root layout

/lib
  /apisports
    client.ts      - API-Sports client
    map.ts         - Response mappers
  /cache
    memoryCache.ts - In-memory caching
  /poisson
    poisson.ts     - Poisson distribution calculations
  types.ts         - TypeScript type definitions
```

## API Routes

All API routes use Node.js runtime and keep the API key secure on the server side.

- `GET /api/health` - Health check endpoint (no API key required)
- `GET /api/fixtures` - Fetch football fixtures
- `GET /api/match` - Get match data and statistics
- `POST /api/poisson` - Calculate Poisson predictions

### GET /api/health

Simple health check endpoint that returns the service status without making any external API calls.

**Query Parameters**: None

**Response**:

```json
{
  "ok": true,
  "data": {
    "status": "up"
  }
}
```

**Example**:

```bash
curl http://localhost:3000/api/health
```

## User Interface

The application includes a web interface at the root URL (`/`) that allows you to:

1. **Fetch Fixtures**: Enter date, league ID, and season to retrieve matches
2. **View Predictions**: Click on any fixture to calculate Poisson predictions
3. **See Results**: View expected goals (λ), match outcome probabilities (1X2), and Over/Under probabilities

The UI only communicates with the API routes and never exposes the API key.

## Smoke Tests

### GET /api/fixtures

Fetch fixtures for a specific date, league, and season.

**Example Request:**

```bash
curl "http://localhost:3000/api/fixtures?date=2024-01-15&leagueId=39&season=2024"
```

**Example Success Response:**

```json
{
  "ok": true,
  "data": [
    {
      "id": 1035198,
      "date": "2024-01-15T20:00:00+00:00",
      "timestamp": 1705348800,
      "venue": {
        "name": "Emirates Stadium",
        "city": "London"
      },
      "status": {
        "short": "FT",
        "long": "Match Finished",
        "elapsed": 90
      },
      "league": {
        "id": 39,
        "name": "Premier League",
        "country": "England",
        "logo": "https://media.api-sports.io/football/leagues/39.png",
        "flag": "https://media.api-sports.io/flags/gb.svg",
        "season": 2024,
        "round": "Regular Season - 21"
      },
      "teams": {
        "home": {
          "id": 42,
          "name": "Arsenal",
          "logo": "https://media.api-sports.io/football/teams/42.png"
        },
        "away": {
          "id": 33,
          "name": "Manchester United",
          "logo": "https://media.api-sports.io/football/teams/33.png"
        }
      },
      "goals": {
        "home": 2,
        "away": 1
      },
      "score": {
        "halftime": {
          "home": 1,
          "away": 0
        },
        "fulltime": {
          "home": 2,
          "away": 1
        },
        "extratime": {
          "home": null,
          "away": null
        },
        "penalty": {
          "home": null,
          "away": null
        }
      }
    }
  ],
  "cached": false
}
```

**Example Error Response (Validation):**

```json
{
  "ok": false,
  "error": {
    "error": "INVALID_DATE",
    "message": "Date must be in YYYY-MM-DD format",
    "code": "VALIDATION_ERROR"
  }
}
```

**Query Parameters:**

- `date` (required): Match date in YYYY-MM-DD format
- `leagueId` (required): League ID (e.g., 39 for Premier League)
- `season` (required): Season year (e.g., 2024)

**Caching:** Results are cached for 10 minutes per unique (date, leagueId, season) combination.

### GET /api/match

Fetch detailed match data for a specific fixture.

**Example Request:**

```bash
curl "http://localhost:3000/api/match?fixtureId=1035198"
```

**Example Success Response:**

```json
{
  "ok": true,
  "data": {
    "fixture": {
      "id": 1035198,
      "date": "2024-01-15T20:00:00+00:00",
      "timestamp": 1705348800,
      "venue": {
        "name": "Emirates Stadium",
        "city": "London"
      },
      "status": {
        "short": "FT",
        "long": "Match Finished",
        "elapsed": 90
      },
      "league": {
        "id": 39,
        "name": "Premier League",
        "country": "England",
        "logo": "https://media.api-sports.io/football/leagues/39.png",
        "flag": "https://media.api-sports.io/flags/gb.svg",
        "season": 2024,
        "round": "Regular Season - 21"
      },
      "teams": {
        "home": {
          "id": 42,
          "name": "Arsenal",
          "logo": "https://media.api-sports.io/football/teams/42.png"
        },
        "away": {
          "id": 33,
          "name": "Manchester United",
          "logo": "https://media.api-sports.io/football/teams/33.png"
        }
      },
      "goals": {
        "home": 2,
        "away": 1
      },
      "score": {
        "halftime": {
          "home": 1,
          "away": 0
        },
        "fulltime": {
          "home": 2,
          "away": 1
        },
        "extratime": {
          "home": null,
          "away": null
        },
        "penalty": {
          "home": null,
          "away": null
        }
      }
    },
    "statistics": {
      "home": {
        "shotsOnGoal": 8,
        "shotsOffGoal": 5,
        "totalShots": 13,
        "possession": 58,
        "passes": 542,
        "passAccuracy": 87,
        "fouls": 11,
        "yellowCards": 2,
        "redCards": 0,
        "offsides": 3,
        "corners": 6
      },
      "away": {
        "shotsOnGoal": 4,
        "shotsOffGoal": 3,
        "totalShots": 7,
        "possession": 42,
        "passes": 398,
        "passAccuracy": 82,
        "fouls": 14,
        "yellowCards": 3,
        "redCards": 0,
        "offsides": 1,
        "corners": 4
      }
    }
  },
  "cached": false
}
```

**Example Error Response (Not Found):**

```json
{
  "ok": false,
  "error": {
    "error": "FIXTURE_NOT_FOUND",
    "message": "No fixture found with ID 999999",
    "code": "NOT_FOUND"
  }
}
```

**Query Parameters:**

- `fixtureId` (required): Fixture ID (must be a positive number)

**Caching:** Results are cached for 30 minutes per fixtureId.

### POST /api/poisson

Calculate Poisson prediction for a specific match.

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/poisson" \
  -H "Content-Type: application/json" \
  -d '{
    "fixtureId": 1035198,
    "window": 10,
    "useHomeAwaySplit": true
  }'
```

**Example Success Response:**

```json
{
  "ok": true,
  "data": {
    "prediction": {
      "homeWin": 0.524,
      "draw": 0.267,
      "awayWin": 0.209
    },
    "expectedGoals": {
      "home": 1.85,
      "away": 1.32
    },
    "overUnder": {
      "over15": 0.783,
      "over25": 0.542
    },
    "scoreMatrix": [],
    "mostLikelyScore": {
      "home": 2,
      "away": 1,
      "probability": 0.184
    }
  }
}
```

**Example Error Response (Insufficient Data):**

```json
{
  "ok": false,
  "error": {
    "error": "INSUFFICIENT_DATA",
    "message": "INSUFFICIENT_DATA: Need at least 3 finished matches, got 2",
    "code": "INSUFFICIENT_DATA"
  }
}
```

**Request Body:**

- `fixtureId` (required): Fixture ID (must be a positive number)
- `window` (required): Number of recent matches to analyze (3-50)
- `useHomeAwaySplit` (required): Boolean - if true, only uses home matches for home team and away matches for away team

**Caching:** Historical match data is cached for 10 minutes per (teamId, leagueId, season, window) combination.

**Error Codes:**

- `BAD_INPUT` - Invalid request parameters
- `MISSING_API_KEY` - API key not configured
- `APISPORTS_ERROR` - Error from external API
- `INSUFFICIENT_DATA` - Not enough historical matches (need at least 3)

## Poisson Distribution Model

This application uses the Poisson distribution to predict football match outcomes. The Poisson distribution is a statistical model that predicts the probability of a given number of events occurring in a fixed interval.

### How It Works

1. **Lambda (λ) Calculation**: The expected number of goals a team will score is calculated from historical match data using `computeLambdasFromMatches()`. This requires at least 3 finished matches.

2. **Probability Calculation**: Using the Poisson PMF (Probability Mass Function), we calculate the probability of each possible score:

   ```
   P(k; λ) = (e^-λ * λ^k) / k!
   ```

3. **Match Outcomes**: By combining the probabilities for both teams across all possible scores (0-0, 1-0, 0-1, etc.), we determine:
   - Home win probability
   - Draw probability
   - Away win probability
   - Over/Under goals probabilities

### Configuration

- **maxGoals = 6**: We calculate probabilities for scores from 0 to 6 goals per team. This covers 99%+ of real-world football matches while keeping calculations efficient.
- Scores beyond 6 goals are extremely rare in professional football and don't significantly affect outcome probabilities.

### Key Functions

- `poissonPmf(lambda, k)` - Calculate probability of exactly k goals given expected value lambda
- `computeOutcomeProbs(lambdaHome, lambdaAway, maxGoals)` - Calculate match outcome and over/under probabilities
- `computeLambdasFromMatches(matches, teamId, mode)` - Calculate expected goals from historical data

### Testing

Run tests with:

```bash
npm test
```

The test suite includes validation for:

- Symmetry: Equal lambdas produce equal win probabilities
- Higher expected goals lead to higher win probability
- Low lambdas produce high Under probabilities

## Common Error Codes

All API endpoints return standardized error responses in the format:

```json
{
  "ok": false,
  "error": {
    "error": "ERROR_CODE",
    "message": "Human-readable error message",
    "code": "ERROR_CATEGORY"
  }
}
```

### Error Reference

| Error Code           | HTTP Status | Description                        | Solution                                                |
| -------------------- | ----------- | ---------------------------------- | ------------------------------------------------------- |
| `MISSING_PARAMETERS` | 400         | Required query parameters missing  | Check API documentation for required parameters         |
| `INVALID_DATE`       | 400         | Date not in YYYY-MM-DD format      | Use correct date format (e.g., 2024-01-15)              |
| `INVALID_SEASON`     | 400         | Season not a 4-digit year          | Use valid year (e.g., 2024)                             |
| `INVALID_LEAGUE_ID`  | 400         | League ID is not a valid number    | Use numeric league ID (e.g., 39 for Premier League)     |
| `INVALID_FIXTURE_ID` | 400         | Fixture ID is invalid or negative  | Use positive numeric fixture ID                         |
| `BAD_INPUT`          | 400         | Invalid request body or parameters | Check request format and parameter types                |
| `FIXTURE_NOT_FOUND`  | 404         | No fixture found with given ID     | Verify fixture ID exists                                |
| `INSUFFICIENT_DATA`  | 400         | Not enough historical matches (<3) | Try increasing the window or choose a different fixture |
| `MISSING_API_KEY`    | 500         | API-Sports key not configured      | Set APISPORTS_API_KEY in .env.local                     |
| `APISPORTS_ERROR`    | 500         | Error from external API            | Check API-Sports service status or API key validity     |
| `API_ERROR`          | 500         | Internal server error              | Check server logs for details                           |

### Troubleshooting

**"MISSING_API_KEY" error:**

- Ensure `.env.local` file exists in root directory
- Verify `APISPORTS_API_KEY` is set correctly
- Restart the development server after adding the key

**"INSUFFICIENT_DATA" error:**

- The teams don't have enough historical matches in the specified league/season
- Try using a larger window (e.g., 15-20 instead of 10)
- Check if the teams have played enough matches in the current season
- Set `useHomeAwaySplit: false` to use all matches instead of just home/away

**"APISPORTS_ERROR" error:**

- Check your API key is valid and not expired
- Verify you haven't exceeded your API quota
- Check API-Sports service status at [api-football.com](https://www.api-football.com/)

## Security

⚠️ **Important**: Never expose your API-Sports key in the frontend. All API calls to external services are made through Next.js API routes that run on the server.

- API key is stored in `.env.local` (excluded from git)
- All external API calls happen server-side in `/app/api/*` routes
- Frontend only communicates with internal API routes

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

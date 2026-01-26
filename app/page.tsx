'use client';

import { useState } from 'react';
import { FixtureSummary, PoissonResponse } from '@/lib/types';

export default function Home() {
  const [date, setDate] = useState('2024-01-15');
  const [leagueId, setLeagueId] = useState('39');
  const [season, setSeason] = useState('2024');
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFixture, setSelectedFixture] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<PoissonResponse | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const fetchFixtures = async () => {
    setLoading(true);
    setError('');
    setFixtures([]);
    setPrediction(null);
    setSelectedFixture(null);

    try {
      const response = await fetch(
        `/api/fixtures?date=${date}&leagueId=${leagueId}&season=${season}`
      );
      const data = await response.json();

      if (!data.ok) {
        setError(data.error?.message || 'Failed to fetch fixtures');
        return;
      }

      setFixtures(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fixtures');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (fixtureId: number) => {
    setLoadingPrediction(true);
    setPrediction(null);
    setSelectedFixture(fixtureId);

    try {
      const response = await fetch('/api/poisson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtureId,
          window: 10,
          useHomeAwaySplit: true,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error?.message || 'Failed to calculate prediction');
        return;
      }

      setPrediction(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate prediction');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Project Noah - Football Predictions
      </h1>

      {/* Input Form */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Fetch Fixtures
        </h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              League ID
            </label>
            <input
              type="number"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              placeholder="39 (Premier League)"
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                width: '180px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Season
            </label>
            <input
              type="number"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="2024"
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                width: '100px',
              }}
            />
          </div>
        </div>
        <button
          onClick={fetchFixtures}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          {loading ? 'Loading...' : 'Hämta matcher'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            background: '#fee',
            color: '#c00',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Fixtures List */}
      {fixtures.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Fixtures ({fixtures.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {fixtures.map((fixture) => (
              <div
                key={fixture.id}
                onClick={() => fetchPrediction(fixture.id)}
                style={{
                  background: selectedFixture === fixture.id ? '#e6f3ff' : 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedFixture !== fixture.id) {
                    e.currentTarget.style.background = '#f9f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFixture !== fixture.id) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                      {fixture.league.name} • {formatDate(fixture.date)}
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                      {fixture.teams.home.name} vs {fixture.teams.away.name}
                    </div>
                    {fixture.goals.home !== null && fixture.goals.away !== null && (
                      <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.25rem' }}>
                        Score: {fixture.goals.home} - {fixture.goals.away}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#0070f3',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    Predict →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction Results */}
      {loadingPrediction && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#666' }}>Calculating prediction...</div>
        </div>
      )}

      {prediction && selectedFixture && (
        <div
          style={{
            background: '#f0f9ff',
            border: '2px solid #0070f3',
            borderRadius: '8px',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Poisson Prediction
          </h2>

          {/* Expected Goals */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Expected Goals (λ)
            </h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Home</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0070f3' }}>
                  {prediction.expectedGoals.home.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Away</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0070f3' }}>
                  {prediction.expectedGoals.away.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Match Outcome (1X2) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Match Outcome (1X2)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Home Win
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {formatPercentage(prediction.prediction.homeWin)}
                </div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Draw
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {formatPercentage(prediction.prediction.draw)}
                </div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  Away Win
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {formatPercentage(prediction.prediction.awayWin)}
                </div>
              </div>
            </div>
          </div>

          {/* Over/Under */}
          {prediction.overUnder && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Over/Under Goals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Over 1.5
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {formatPercentage(prediction.overUnder.over15)}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Over 2.5
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {formatPercentage(prediction.overUnder.over25)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Most Likely Score */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Most Likely Score
            </h3>
            <div
              style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>
                {prediction.mostLikelyScore.home} - {prediction.mostLikelyScore.away}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Probability: {formatPercentage(prediction.mostLikelyScore.probability)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'white',
              borderRadius: '4px',
              fontSize: '0.875rem',
              color: '#666',
            }}
          >
            Based on last 10 matches with home/away split
          </div>
        </div>
      )}
    </main>
  );
}

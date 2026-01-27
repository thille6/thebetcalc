'use client';

import { useState } from 'react';

interface FixtureSummary {
  id: number;
  date: string;
  teams: {
    home: { name: string };
    away: { name: string };
  };
  status: {
    short: string;
    long: string;
  };
}

export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(today);
  const [leagueId, setLeagueId] = useState('39');
  const [season, setSeason] = useState('2026');
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFixtures = async () => {
    setLoading(true);
    setError('');
    setFixtures([]);

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        TheBetCalc – Fixtures
      </h1>

      {/* Input Form */}
      <div style={{ marginBottom: '2rem' }}>
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
              placeholder="2026"
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
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Fixtures ({fixtures.length})
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {fixtures.map((fixture) => (
              <li
                key={fixture.id}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ fontWeight: '500', fontSize: '1.125rem' }}>
                  {fixture.teams.home.name} vs {fixture.teams.away.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                  {formatDateTime(fixture.date)} — {fixture.status.long}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          No fixtures loaded. Select date and league, then click "Hämta matcher".
        </div>
      )}
    </main>
  );
}

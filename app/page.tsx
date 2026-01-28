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
  score?: {
    home: number | null;
    away: number | null;
  };
}

export default function Home() {
  // Default to tomorrow - more likely to have matches scheduled
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [date, setDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [leagueId, setLeagueId] = useState(''); // Empty = all leagues
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFixtures = async () => {
    setLoading(true);
    setError('');
    setFixtures([]);

    try {
      const response = await fetch(
        `/api/fixtures?date=${date}&leagueId=${leagueId}`
      );
      const data = await response.json();

      if (!data.ok) {
        setError(data.error?.message || 'Failed to fetch fixtures');
        return;
      }

      setFixtures(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>TheBetCalc - Football Fixtures</h1>
      <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Free tier access - showing matches from supported competitions
      </p>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="date">
            Date:
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem', width: '150px' }}
            />
          </label>
          <button
            onClick={() => {
              const today = new Date();
              setDate(today.toISOString().split('T')[0]);
            }}
            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
          >
            Today
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDate(tomorrow.toISOString().split('T')[0]);
            }}
            style={{ marginLeft: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
          >
            Tomorrow
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="league">
            League (optional):
            <select
              id="league"
              name="league"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
            >
              <option value="">All Leagues</option>
              <option value="PL">Premier League</option>
              <option value="CL">Champions League</option>
              <option value="ELC">Championship</option>
              <option value="BL1">Bundesliga</option>
              <option value="SA">Serie A</option>
              <option value="PD">La Liga</option>
              <option value="FL1">Ligue 1</option>
            </select>
          </label>
        </div>

        <button
          onClick={fetchFixtures}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Fetch Fixtures'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {fixtures.length > 0 && (
        <div>
          <h2>{fixtures.length} Fixtures Found</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {fixtures.map((fixture) => (
              <li
                key={fixture.id}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {fixture.teams.home.name} vs {fixture.teams.away.name}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {formatDateTime(fixture.date)} • Status: {fixture.status.long}
                </div>
                {fixture.score && (
                  <div style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>
                    Score: {fixture.score.home} - {fixture.score.away}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && (
        <p style={{ color: '#666' }}>No fixtures found. Try a different date or league.</p>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([api.stats(), api.myScores()]);
        setStats(s);
        setHistory(h.scores);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) return <div className="card"><p className="error">{error}</p></div>;

  return (
    <div className="card">
      <h2>My Statistics</h2>
      {!stats || stats.totalGames === 0 ? (
        <p>Play a quiz to see your stats.</p>
      ) : (
        <div className="stat-grid">
          <div><strong>{stats.totalGames}</strong><span>Games</span></div>
          <div><strong>{stats.bestScore}%</strong><span>Best score</span></div>
          <div><strong>{stats.averageAccuracy}%</strong><span>Avg accuracy</span></div>
          <div>
            <strong>{(stats.averageTimePerQuestionMs / 1000).toFixed(1)}s</strong>
            <span>Avg time/Q</span>
          </div>
        </div>
      )}

      <h3>Recent games</h3>
      {history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        <ul className="history">
          {history.slice(0, 10).map((s, i) => (
            <li key={i}>
              {s.score}% · {s.correctAnswers}/{s.totalQuestions} · {s.category} ·{' '}
              {new Date(s.completedAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const params = {};
      if (category) params.category = category;
      const data = await api.leaderboard(params);
      setBoard(data.leaderboard);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="card">
      <h2>Leaderboard</h2>
      {error && <p className="error">{error}</p>}
      <label className="inline">
        Category filter
        <input
          type="text"
          placeholder="e.g. science"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={load}>Filter</button>
      </label>
      {board.length === 0 ? (
        <p>No scores yet — be the first to play!</p>
      ) : (
        <ol className="board">
          {board.map((row, i) => (
            <li key={i}>
              <span className="rank">#{i + 1}</span>
              <span className="name">{row.username}</span>
              <span className="cat">{row.category}</span>
              <span className="pts">{row.score}%</span>
              <span className="meta">
                {row.correctAnswers}/{row.totalQuestions} ·{' '}
                {(row.averageTimeMs / 1000).toFixed(1)}s
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, clearToken, isLoggedIn } from './api.js';
import Auth from './components/Auth.jsx';
import Quiz from './components/Quiz.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Stats from './components/Stats.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('play'); // play | leaderboard | stats
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setView('play');
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  if (loading) return <div className="center">Loading…</div>;
  if (!isLoggedIn()) return <Auth onAuth={handleAuth} />;

  return (
    <div className="app">
      <header className="topbar">
        <h1>🧠 Quiz App</h1>
        <nav>
          <button className={view === 'play' ? 'active' : ''} onClick={() => setView('play')}>
            Play
          </button>
          <button
            className={view === 'leaderboard' ? 'active' : ''}
            onClick={() => setView('leaderboard')}
          >
            Leaderboard
          </button>
          <button className={view === 'stats' ? 'active' : ''} onClick={() => setView('stats')}>
            My Stats
          </button>
        </nav>
        <div className="user">
          <span>{user?.username}</span>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        {view === 'play' && <Quiz user={user} />}
        {view === 'leaderboard' && <Leaderboard />}
        {view === 'stats' && <Stats />}
      </main>
    </div>
  );
}

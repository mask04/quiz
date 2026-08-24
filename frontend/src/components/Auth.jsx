import React, { useState } from 'react';
import { api } from '../api.js';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload =
        mode === 'register'
          ? { username: form.username, email: form.email, password: form.password }
          : { email: form.email, password: form.password };
      const data = mode === 'register' ? await api.register(payload) : await api.login(payload);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth center">
      <div className="card">
        <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          {mode === 'register' && (
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={change}
              required
              minLength={3}
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={change}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={change}
            required
            minLength={6}
          />
          <button type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </form>
        <p className="switch">
          {mode === 'login' ? "No account?" : 'Have an account?'}{' '}
          <button
            className="link"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

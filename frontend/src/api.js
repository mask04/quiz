const TOKEN_KEY = 'quiz_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  getQuiz: (params = {}) =>
    request(`/quiz/questions?${new URLSearchParams(params).toString()}`),
  submitQuiz: (body) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(body) }),
  stats: () => request('/quiz/stats'),
  leaderboard: (params = {}) =>
    request(`/scores/leaderboard?${new URLSearchParams(params).toString()}`),
  myScores: () => request('/scores/me')
};

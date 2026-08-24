# Quiz Frontend

An interactive **React (Vite)** single-page app that consumes the Quiz REST API.

## Features

- Register / login (JWT stored in `localStorage`)
- Play a random quiz (choose number of questions, category, optional timed mode)
- Per-question countdown timer in timed mode, with auto-skip on timeout
- Instant score, accuracy, and average-time results with answer review
- Live leaderboard (with category filter)
- Personal statistics and recent-game history

## Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to the
backend at `http://localhost:4000` (configured in `vite.config.js`), so CORS
is not an issue during development.

Make sure the backend API is running first (`cd .. && npm start`).

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

You can serve `dist/` from any static host, or have the Express backend serve it
by copying the build output into the API's `public/` folder.

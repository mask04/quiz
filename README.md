# Quiz API

A RESTful quiz application built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.
It supports full CRUD on questions, answer validation, score calculation/storage,
a leaderboard, JWT authentication, CORS for external frontends, and several advanced
features (timed quizzes, detailed statistics, JSON/CSV export).

## Tech Stack

- Node.js + Express — routing & server logic
- MongoDB + Mongoose — data storage (questions, users, scores)
- JWT (`jsonwebtoken`) — authentication
- `bcryptjs` — password hashing
- `cors` — cross-origin access for React/Vue/Angular frontends
- `dotenv` — environment variable management
- `json2csv` — CSV export

## Project Structure

```
quiz-api/
├── .env.example
├── .gitignore
├── package.json
├── server.js                 # entry point
├── src/
│   ├── app.js                # express app, route mounting, error handler
│   ├── config/
│   │   └── db.js             # mongoose connection
│   ├── middleware/
│   │   ├── auth.js           # JWT auth + admin guard
│   │   └── errorHandler.js   # centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   └── Score.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   ├── quizController.js
│   │   └── scoreController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── quizRoutes.js
│   │   └── scoreRoutes.js
│   └── utils/
│       └── seed.js           # seed admin user + sample questions
└── README.md
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env and set a strong JWT_SECRET and your MONGODB_URI

# 3. Start MongoDB (local instance on default port)

# 4. (Optional) Seed an admin user + sample questions
npm run seed

# 5. Run the server
npm start          # or: npm run dev (with nodemon)
```

The API will be available at `http://localhost:4000`.

## Environment Variables

| Variable          | Description                                  |
| ----------------- | -------------------------------------------- |
| `PORT`            | Server port (default `4000`)                 |
| `MONGODB_URI`     | MongoDB connection string                    |
| `JWT_SECRET`      | Secret used to sign JWTs                     |
| `JWT_EXPIRES_IN`  | Token expiry (default `7d`)                  |
| `ADMIN_USERNAME`  | Admin username used by the seed script       |
| `ADMIN_EMAIL`     | Admin email used by the seed script          |
| `ADMIN_PASSWORD`  | Admin password used by the seed script       |

## Authentication

Most endpoints require a JWT. Obtain one via login, then send it as:

```
Authorization: Bearer <token>
```

Only `admin` users may create/update/delete questions. Any authenticated user can
play quizzes and record scores.

## API Reference

### Auth — `https://localhost:4000/api/auth`
| Method | Path      | Auth | Description            |
| ------ | --------- | ---- | ---------------------- |
| POST   | /register | —    | Register a new user    |
| POST   | /login    | —    | Login, returns JWT     |
| GET    | /me       | ✓    | Current user profile   |

### Questions — `/api/questions`  (read: any user, write: admin)
| Method | Path | Description            |
| ------ | ---- | ---------------------- |
| GET    | /    | List questions (filter `category`, `difficulty`, `page`, `limit`) |
| GET    | /:id | Get a single question  |
| POST   | /    | Create a question      |
| PUT    | /:id | Update a question      |
| DELETE | /:id | Delete a question      |

**Create question body example:**
```json
{
  "text": "What is 2 + 2?",
  "category": "math",
  "difficulty": "easy",
  "timeLimit": 10,
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false }
  ]
}
```

### Quiz — `/api/quiz`
| Method | Path       | Auth | Description                                  |
| ------ | ---------- | ---- | -------------------------------------------- |
| GET    | /questions | ✓    | Get random playable questions (no answers)   |
| POST   | /submit    | ✓    | Submit answers, validate, store score        |
| GET    | /stats     | ✓    | Detailed statistics for the current player   |

**Submit body example** (`selectedOption` may be an option `_id` or a 0-based index):
```json
{
  "timed": true,
  "answers": [
    { "questionId": "<id>", "selectedOption": 1, "timeTakenMs": 4200 },
    { "questionId": "<id>", "selectedOption": "<optionId>", "timeTakenMs": 3100 }
  ]
}
```
The response returns the computed `score` (0–100), correct/wrong counts, average
time per question, and a per-question correctness breakdown.

### Scores — `/api/scores`
| Method | Path         | Auth | Description                                  |
| ------ | ------------ | ---- | -------------------------------------------- |
| GET    | /leaderboard | —    | Top scores (`category`, `limit` query params)|
| GET    | /export      | —    | Export all scores as JSON or CSV (`format`)  |
| GET    | /me          | ✓    | Authenticated user's score history           |

**Export examples:**
```
GET /api/scores/export?format=json
GET /api/scores/export?format=csv&category=science
```

## Advanced Features Implemented

- **Timed quizzes** — each question can carry a `timeLimit`; clients report
  `timeTakenMs` per answer and the server aggregates total/average time.
- **Detailed statistics** — `/api/quiz/stats` returns games played, accuracy,
  best score, and average response time.
- **Result export** — `/api/scores/export` produces downloadable JSON or CSV.
- **CORS enabled** — ready to be consumed by a React / Vue / Angular frontend.

## Frontend Integration

A ready-made interactive frontend lives in [`frontend/`](./frontend) (React +
Vite). It implements login/register, quiz play with timed mode, results review,
leaderboard, and personal statistics. See `frontend/README.md`.

To point your own SPA at this API, target `http://localhost:4000/api`. Call
`/api/auth/login` to get a token, store it, and attach it as a `Bearer` header on
protected requests. `/api/quiz/questions` gives shuffled questions for a round;
`/api/quiz/submit` validates answers and records the score automatically.

## Running the Full Stack

```bash
# Terminal 1 — backend
npm install
cp .env.example .env
# start MongoDB, then:
npm run seed
npm start

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies `/api` to the backend on port 4000.

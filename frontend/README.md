# ScholarShare frontend

React (Vite) client for the existing FastAPI academic resource platform.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Required environment variable:

```
VITE_API_BASE_URL=http://localhost:8000
```

Start the FastAPI backend on port 8000, then:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Backend notes used by this client

- Login is `POST /auth/signin` with `{ email, password }`.
- Registration is `POST /auth/signup` with `{ roll_no, name, email, password, regulation_year }`. Department is inferred from the roll number.
- There are no list endpoints for departments, courses, or units, so upload and course-registration forms use text inputs.
- My Uploads / ratings / recent activity use `GET /dashboard` (latest 10). There is no paginated history API.

# Smart Academic Resource Sharing Platform

FastAPI backend plus a React frontend for sharing lecture notes, presentations, and previous-year question papers.

## Backend

```bash
python -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
brew services start redis
uvicorn main:app --reload --port 8000
```

Configure the existing `.env` for PostgreSQL/Supabase, Redis, and JWT. Do not put Supabase secret keys in the frontend.

CORS allows `http://localhost:5173` so the Vite client can call the API.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`VITE_API_BASE_URL` defaults to `http://localhost:8000`.

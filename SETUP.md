# SETUP.md — Bring Your Own Everything

This repo is a **self-hostable template**: there are no OpenELD-hosted servers, no
shared API keys, and no lock-in. You clone it, plug in your own services, and run
it wherever you like. Nothing in the repo phones home.

- Zero paid APIs by default (routing = OSRM, geocoding = Nominatim, both free).
- Optional sign-in via **your own Firebase project** — skip it entirely and the
  app still works, just without accounts.
- Database: SQLite (zero config) or Postgres (recommended for production).

---

## 1. What you need before you start

| Service | Needed? | What for | Get it from |
|---|---|---|---|
| **Firebase project** | Optional (recommended) | Google/email sign-in + cloud trip history | [console.firebase.google.com](https://console.firebase.google.com) — create a project, enable **Authentication** (Email/Password and/or Google sign-in providers) |
| **Postgres database** | Optional (prod only) | Storing trips when scaled up | Any provider: Neon, Supabase, Render Postgres, or self-hosted. Local dev works on SQLite. |
| **OSRM server** | Optional | Route geometry + distances | Defaults to the free public server `router.project-osrm.org`. For privacy/reliability, self-host from [osrm-backend](https://github.com/Project-OSRM/osrm-backend). |
| **Nominatim server** | Optional | Geocoding addresses to coordinates | Defaults to the free public `nominatim.openstreetmap.org` (1 req/sec rate limit). Self-host from [nominatim.org](https://nominatim.org) if you need more. |
| **Docker** | For local run | Runs backend + frontend | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **A domain / host** | For deploy | Serving the app publicly | Whatever you want — VPS, Render, Fly.io, PythonAnywhere, a home server… |

You do **not** need any API key for OSRM or Nominatim. If you skip Firebase, you
skip every paid/cloud dependency entirely.

---

## 2. Fill in the environment files

Two files, both already committed with safe placeholders:

```
cp backend/.env.example backend/.env
cp app/.env.example      app/.env
```

### backend/.env — the API server

| Variable | What it does | How to fill it in |
|---|---|---|
| `DJANGO_SECRET_KEY` | Signs sessions/CSRF. **Required unique value in prod.** | Generate: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_DEBUG` | `True` locally, `False` in production | — |
| `DJANGO_ALLOWED_HOSTS` | Hostnames the backend answers to | `localhost,127.0.0.1` locally; add `api.your-domain.com` in prod |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Which frontend origins may call the API | `http://localhost:3000` locally; your frontend domain in prod |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Same, for state-changing requests | Same value as CORS |
| `FRONTEND_URL` | Optional shortcut — one frontend origin added to both lists above | e.g. `https://app.your-domain.com` |
| `DJANGO_CORS_ALLOW_CREDENTIALS` | Leave as `True` | — |
| `DJANGO_SECURE_SSL_REDIRECT` / `_SESSION_COOKIE_SECURE` / `_CSRF_COOKIE_SECURE` / `DJANGO_SECURE_HSTS_SECONDS` | HTTPS hardening | `False`/`0` locally; `True`/`3600` in production behind TLS |
| `DATABASE_URL` | Postgres connection string | `postgres://user:pass@host:5432/dbname`. Leave empty for SQLite |
| `SQLITE_DATABASE_PATH` | SQLite file location | Leave empty (defaults to `backend/db.sqlite3`) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Server-side Firebase auth (Admin SDK) | Firebase Console → Project Settings → **Service Accounts** → *Generate new private key*. Paste `project_id`, `client_email`, and the whole `private_key` on **one line** (literal `\n` in the JSON is fine — the app converts them). All three empty = auth disabled. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Legacy JSON-path fallback | Leave empty. Never commit the JSON file. |
| `OSRM_BASE_URL` | Routing endpoint | Default public server is fine; paste your own instance URL if self-hosting |
| `NOMINATIM_BASE_URL` | Geocoding endpoint | Default public server is fine; paste your own instance URL if self-hosting |

### app/.env — the React frontend

| Variable | What it does | How to fill it in |
|---|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API, **no trailing slash** | `http://127.0.0.1:8000/api` locally; `https://api.your-domain.com/api` in prod |
| `REACT_APP_FIREBASE_API_KEY` | Firebase web app key (public by design) | Firebase Console → Project Settings → **Your apps** → Web app config |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` | Same place |
| `REACT_APP_FIREBASE_PROJECT_ID` | Your project id | Same place |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | e.g. `your-project.appspot.com` | Same place |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Numeric id | Same place |
| `REACT_APP_FIREBASE_APP_ID` | e.g. `1:123456789:web:abc…` | Same place |

All Firebase vars empty = the sign-in screen is skipped and the app runs
unauthenticated (history is stored in your browser).

> Note: `REACT_APP_*` values are baked into the JS bundle at **build** time. If
> you change them, rebuild (or redeploy) — a running dev server may need a
> restart to pick them up.

---

## 3. Run locally with Docker

Requires Docker Desktop (or a Docker daemon). Nothing else needs installing.

```bash
git clone <your-fork-url> openeld
cd openeld
cp backend/.env.example backend/.env
cp app/.env.example      app/.env
# (edit the two .env files per section 2 — even all-empty works)
docker compose up --build
```

Then:

- Product UI → **http://localhost:3000**
- API → **http://localhost:8000** (health check: `http://localhost:8000/healthz/`)

Notes:

- First build takes a few minutes (installs Python + Node deps).
- Trip data persists in the `openeld_data` Docker volume (SQLite).
- Don't run without Docker? See the "Without Docker" section in [README.md](README.md).

---

## 4. Deploy it yourself

Both paths below use the same pattern: **run the backend with your env vars, serve
the frontend against it, point `REACT_APP_API_URL` at the backend**. Any other host
(Flask-style PAAS, k8s, a Raspberry Pi) is just these three steps with different
buttons.

### Path A — Any VPS / server with Docker (recommended)

One container serves everything (Django serves the compiled React app too):

```bash
# On your server:
git clone <your-fork-url> openeld && cd openeld
cp backend/.env.example backend/.env
# edit backend/.env: SECRET_KEY, DEBUG=False, ALLOWED_HOSTS=your-domain,
# CORS/CSRF origins, HTTPS flags, FIREBASE_* (if using auth), DATABASE_URL (optional)

# Build with your frontend config baked in:
docker build \
  --build-arg REACT_APP_API_URL=https://api.your-domain.com/api \
  --build-arg REACT_APP_FIREBASE_API_KEY=... \
  --build-arg REACT_APP_FIREBASE_AUTH_DOMAIN=... \
  --build-arg REACT_APP_FIREBASE_PROJECT_ID=... \
  --build-arg REACT_APP_FIREBASE_STORAGE_BUCKET=... \
  --build-arg REACT_APP_FIREBASE_MESSAGING_SENDER_ID=... \
  --build-arg REACT_APP_FIREBASE_APP_ID=... \
  -t openeld .

# Run it:
docker run -d -p 8000:8000 --env-file backend/.env \
  -v openeld_data:/app/backend/data openeld
```

Then put nginx/Caddy in front of it for TLS, or use the platform's TLS. The
Dockerfile runs migrations automatically on start.

### Path B — Render (backend) + Vercel (frontend)

`render.yaml` and `vercel.json` are already in the repo — use them as a reference
for any similar PaaS:

1. **Backend on Render** — create a new service → *Deploy from repo* → Render will
   pick up `render.yaml` (Docker runtime). Or manually: build `Dockerfile`, port
   8000, health check `/healthz/`. Set the backend env vars from section 2 in the
   Render dashboard (add a **Postgres** instance and Render injects
   `DATABASE_URL` automatically).
2. **Frontend on Vercel** — import the same repo. `vercel.json` points Vercel at
   the `app/` subdirectory. Add the `REACT_APP_*` env vars from section 2 in
   Vercel → Project → Settings → Environment Variables (set `REACT_APP_API_URL`
   to your Render backend, e.g. `https://your-backend.onrender.com/api`), then
   deploy.
3. **Point them at each other** — your Render `DJANGO_ALLOWED_HOSTS`,
   `DJANGO_CORS_ALLOWED_ORIGINS`, and `DJANGO_CSRF_TRUSTED_ORIGINS` must include
   your Vercel domain (`https://your-app.vercel.app`).
4. **Firebase authorized domains** — in Firebase Console → Authentication →
   Settings → Authorized domains, add your Vercel domain, or Google/email sign-in
   will be rejected in production.

### Applying this pattern to any other host

Whatever platform you pick, the three things to wire up are always:

1. Backend env vars (section 2) + a reachable backend URL.
2. Frontend env vars (section 2), especially `REACT_APP_API_URL` → backend URL.
3. CORS/CSRF/host allow-lists on the backend that include the frontend origin,
   and your frontend domain in Firebase's authorized domains.

---

## 5. Verify it works

```bash
# Backend
curl http://localhost:8000/healthz/     # -> {"status": "ok"}
# Plan a trip (no auth required when Firebase is unconfigured)
curl -X POST http://localhost:8000/api/trips/plan/ \
  -H "Content-Type: application/json" \
  -d '{"current_location":"New York, NY","pickup_location":"Chicago, IL","dropoff_location":"Los Angeles, CA","current_cycle_hours":14}'
```

In the UI: plan a trip from the sidebar. If Firebase is configured you'll see the
sign-in screen first; if not, the app goes straight to the planner.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `REACT_APP_API_URL is not set` (frontend build fails) | You built without frontend env — pass `--build-arg REACT_APP_API_URL=...` or use `docker compose up --build` |
| API returns 403 on POST / CORS errors in the console | Backend `DJANGO_ALLOWED_HOSTS` / CORS / CSRF lists don't include your frontend origin |
| Google sign-in fails with `unauthorized-domain` | Add your frontend domain in Firebase → Authentication → Authorized domains |
| `Firebase not configured (missing env vars)` from the API | Backend `FIREBASE_PROJECT_ID` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL` not set together |
| Health check green but UI can't reach API | `REACT_APP_API_URL` has a trailing slash, or points at a different host than the one serving the API |

---

## 6. Rebranding

Instance branding (app name, logo, default carrier name, download/localStorage
prefixes) lives in two small files, not scattered through the codebase:

- `app/src/config.js` — frontend branding
- `backend/eld_trip_planner/config.py` — backend branding (log-sheet carrier name)

Edit those and rebuild. Replace `app/public/logo.png` with your own logo.

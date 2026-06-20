# OpenELD

**The open-source ELD trip planner — free yourself from $200/month SaaS contracts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/anukulKun/OpenELD/actions/workflows/ci.yml/badge.svg)](https://github.com/anukulKun/OpenELD/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?logo=discord)](https://discord.gg/YOUR_INVITE)

Every commercial truck driver in the US must track Hours of Service (HOS), plan compliant routes, and submit daily log sheets. The tools that do this cost $150–200 per truck per month, lock you into hardware contracts, and still make drivers fill out paperwork.

OpenELD is the free, self-hosted alternative. No subscriptions. No hardware dongles. No per-seat pricing. Give it a route and it tells you exactly when to drive, when to stop, and hands you FMCSA-ready log sheets.

---

## What it does

- **Trip planning** — Enter current location, pickup, and dropoff. OpenELD plots the route and calculates every required stop.
- **HOS enforcement** — Plans against FMCSA rulesets (70/8, 60/7, Alaska variants) and flags violations before you leave.
- **Daily log sheets** — Generates FMCSA-format daily logs for every day of the trip as printable SVG/PDF.
- **Live tracking** — Browser GPS feeds a live marker with heading, speed, and next-stop distance.
- **No paid APIs** — Routing uses OSRM. Geocoding uses OpenStreetMap Nominatim.

---

## Quick start

### Docker (recommended)

```bash
git clone https://github.com/anukulKun/OpenELD.git
cd OpenELD
cp backend/.env.example backend/.env
docker compose up --build
```

Product UI → `http://localhost:3000` · API → `http://localhost:8000`

### Without Docker

**Backend** (one command — creates venv, installs deps, runs migrations):

```bash
backend-dev.bat
```

**Product app** (separate terminal):

```bash
cd app
npm install --legacy-peer-deps
npm start
```

---

## Repo structure

| Folder | What |
|---|---|---|
| [`landing/`](landing) | Marketing site — public website (Next.js) |
| [`app/`](app) | Product dashboard — trip planner UI (React) |
| [`backend/`](backend) | API server — Django REST API, HOS engine, routing |
| [`.github/`](.github) | CI workflows, issue templates |

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/trips/plan/` | Calculate full route and HOS plan |
| `GET` | `/api/trips/` | List stored trips |
| `GET` | `/api/trips/{id}/logs/` | Daily logs for a trip |
| `GET` | `/healthz/` | Health check |

Example request:

```json
{
  "current_location": "New York, NY",
  "pickup_location": "Chicago, IL",
  "dropoff_location": "Los Angeles, CA",
  "start_time": "2026-05-08T18:11",
  "hos_rules": "70-hour/8-day",
  "current_cycle_hours": 14
}
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Landing | Next.js 14, Static Export |
| Product app | React 18, Leaflet, Axios |
| Backend | Django 4.1, DRF |
| Database | SQLite (dev), Postgres (prod) |
| Routing | OSRM + haversine fallback |
| Deployment | Docker, Render, Vercel |

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Before opening a PR:

```bash
python backend/manage.py check
cd app && npm run build
cd landing && npm run build
```

---

## License

MIT — see [LICENSE](LICENSE).

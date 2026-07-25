<div align="center">

# OpenELD

**The open-source ELD trip planner for commercial truck drivers**

**Plan routes. Enforce HOS. Generate FMCSA-ready logs — for free.**

No hardware dongles. No subscriptions. No $40/truck/month SaaS contracts.

[Docs](https://github.com/openeld-org/openeld#api) &nbsp;·&nbsp;
[Live app](https://openeld.vercel.app) &nbsp;·&nbsp;
[Discord](https://discord.gg/YOUR_INVITE)

</div>

<p align="center">
  <a href="https://github.com/openeld-org/openeld/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-000000.svg" /></a>
  <a href="https://github.com/openeld-org/openeld/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/openeld-org/openeld/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://discord.gg/YOUR_INVITE"><img alt="Discord" src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?logo=discord&logoColor=white" /></a>
  <a href="https://openeld.vercel.app"><img alt="Live app" src="https://img.shields.io/badge/Live-app.openeld.xyz-000000" /></a>
</p>

---

## What is OpenELD?

Every commercial truck driver in the US must log Hours of Service (HOS), plan FMCSA-compliant routes, and produce daily log sheets for roadside inspection. The tools that do this cost **$20–$40 per truck per month**, lock you into 3-year hardware contracts, and still make drivers fill out paperwork.

OpenELD is the self-hosted alternative. Give it a route — it tells you exactly when to drive, when to stop, and hands you print-ready FMCSA log sheets. No accounts. No vendor lock-in. No monthly bill.

## Why OpenELD?

**The ELD market is broken for small operators.** Owner-operators and small fleets pay the same enterprise rates as 500-truck companies, for dashboards full of features they'll never touch.

1. **Zero recurring cost.** Self-host on your own server or a $5 VPS. The only cost is your time.

2. **No hardware required.** Browser GPS on any phone or tablet replaces proprietary dongles. No technician, no install window, no hardware contracts.

3. **FMCSA-compliant output.** Generates daily log sheets in FMCSA format, enforces 70/8 and 60/7 rulesets, and flags violations before the truck leaves the yard.

4. **No paid APIs.** Routing runs on OSRM. Geocoding runs on OpenStreetMap Nominatim. The entire stack is open-source.

## How it works

```
Driver enters: current location → pickup → dropoff
        │
        ▼
OpenELD fetches the route via OSRM
        │
        ▼
HOS engine applies FMCSA ruleset (70/8, 60/7, Alaska variants)
        │
        ▼
Calculates every required rest stop + flags violations
        │
        ▼
Generates FMCSA-format daily log sheets → printable SVG/PDF
        │
        ▼
Live GPS tracker shows heading, speed, and distance to next stop
```

---

## Quick start

### Docker (recommended)

```bash
git clone https://github.com/openeld-org/openeld.git
cd openeld
cp backend/.env.example backend/.env
docker compose up --build
```

App → `http://localhost:3000` · API → `http://localhost:8000`

### Without Docker

**Backend** — creates virtualenv, installs deps, runs migrations in one command:

```bash
backend-dev.bat          # Windows
# or: cd backend && pip install -r requirements.txt && python manage.py runserver
```

**Frontend** (separate terminal):

```bash
cd app
npm install --legacy-peer-deps
npm start
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/trips/plan/` | Calculate full route + HOS plan |
| `GET` | `/api/trips/` | List stored trips |
| `GET` | `/api/trips/{id}/logs/` | Daily logs for a trip |
| `GET` | `/healthz/` | Health check |

**Example request:**

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

## Repo structure

> The OpenELD marketing site lives at [openeld-org/landing](https://github.com/openeld-org/landing).

| Folder | What it does |
|---|---|
| [`app/`](app) | Trip planner UI — React 18, Leaflet, Axios |
| [`backend/`](backend) | API server — Django 4.1, DRF, HOS engine, OSRM routing |
| [`.github/`](.github) | CI workflows, issue templates |

---

## Tech stack

| Layer | Technology |
|---|---|
| Product UI | React 18, Leaflet, Axios |
| Backend | Django 4.1, Django REST Framework |
| HOS Engine | Custom Python — 70/8, 60/7, Alaska rulesets |
| Routing | OSRM + haversine fallback |
| Geocoding | OpenStreetMap Nominatim |
| Database | SQLite (dev) · Postgres (prod) |
| Deployment | Docker · Render · Vercel |

---

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

Bug fixes and small improvements are the best way to start. For larger features, open an issue first so we can align on the roadmap. Before submitting a PR:

```bash
python backend/manage.py check
cd app && npm run build
```

Join the conversation on [Discord](https://discord.gg/YOUR_INVITE).

---

## License

Licensed under the [MIT License](LICENSE).

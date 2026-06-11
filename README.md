# OpenELD

**The open-source ELD for everyone who's tired of paying $200/month to Samsara.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/anukulKun/OpenELD)](https://github.com/anukulKun/OpenELD/commits/main)
[![Stars](https://img.shields.io/github/stars/anukulKun/OpenELD?style=social)](https://github.com/anukulKun/OpenELD/stargazers)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/YOUR_INVITE)

![OpenELD — route map, HOS dashboard, and daily log sheets in one place](image.png)


The US trucking industry runs on HOS compliance. Every commercial driver must track their hours, plan their stops, and submit daily log sheets — or face fines, violations, and pulled operating authority. The tools that do this cost $150–200 per truck per month, lock you into hardware contracts, and still make drivers fill out paperwork.

OpenELD is the free alternative. Self-host it in minutes. No subscriptions, no hardware dongles, no per-seat pricing. Just give it a route and it tells you exactly when to drive, when to stop, and hands you FMCSA-ready log sheets.


## What it does

**Trip planning.** Give it a current location, pickup, and dropoff. OpenELD plots the route, calculates every required stop — fuel every 1,000 miles, mandatory 30-minute breaks, 10-hour sleeper resets — and tells you exactly when you arrive and how much cycle you have left.

**HOS enforcement.** The planning engine runs against your selected ruleset (70/8, 60/7, or Alaska variants) and flags violations before you leave the yard — shift drive limit exceeded, duty window blown, cycle running low. Warnings before the weigh station, not after.

**Daily log sheets.** Generates FMCSA-format daily logs for every day of the trip as printable SVG. Download the full trip plan as JSON or print individual sheets directly from the dashboard.

**Live tracking.** Browser GPS feeds a live marker with heading, speed HUD, and next-stop distance. The driver console shows remaining drive time, duty window, and cycle in real time.

**No paid API keys required.** Routing uses OSRM. Geocoding uses Nominatim. Deploy it and it works.


## Quick Start

```bash
git clone https://github.com/anukulKun/OpenELD.git
cd OpenELD
cp .env.example .env
docker compose up
```

Open [http://localhost:8000](http://localhost:8000).


## Local Development

**Backend** (Python 3.12, Django 4.1)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend** (Node 20, React 18)

```bash
cd frontend
npm install
npm start
```

React runs at `http://localhost:3000`, API at `http://127.0.0.1:8000/api`.


## Deploy to Render

Push to GitHub → [render.com](https://render.com) → **New → Blueprint** → select this repo. Render provisions the web service and Postgres automatically.


## HOS Engine

OpenELD's planner is in `backend/hos_calculator/`. It models a full driving shift — drive limits, duty windows, break requirements, fuel stops, cycle exhaustion, and 34-hour restarts — and splits everything into per-day FMCSA log data.

| Ruleset | Cycle | Days | Drive Limit | Duty Window |
|---------|-------|------|-------------|-------------|
| 70-hour/8-day | 70h | 8 | 11h | 14h |
| 60-hour/7-day | 60h | 7 | 11h | 14h |
| Alaska 70-hour/7-day | 70h | 7 | 15h | 20h |
| Alaska 80-hour/8-day | 80h | 8 | 15h | 20h |

> OpenELD is a planning tool, not a certified ELD device. It does not implement split sleeper berth, adverse conditions exemptions, or short-haul exceptions. Always verify compliance with your ELD provider.


## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trips/plan/` | Calculate full route + HOS plan |
| `GET` | `/api/trips/` | List stored trips |
| `GET` | `/api/trips/recent/` | Latest 5 trips |
| `GET` | `/api/trips/{id}/logs/` | Daily logs for a trip |
| `GET` | `/healthz/` | Health check |

```json
{
  "driver_name": "John Doe",
  "current_location": "New York, NY",
  "pickup_location": "Chicago, IL",
  "dropoff_location": "Los Angeles, CA",
  "start_time": "2026-05-08T18:11",
  "hos_rules": "70-hour/8-day",
  "current_cycle_hours": 14
}
```


## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Leaflet, Axios |
| Backend | Django 4.1, Django REST Framework |
| Database | SQLite (local) / Postgres (production) |
| Routing | OSRM, haversine fallback |
| Geocoding | OpenStreetMap Nominatim |
| Serving | Gunicorn + WhiteNoise |
| Deployment | Docker, Render Blueprint |


## Contributing

PRs welcome. Open an [issue](https://github.com/anukulKun/OpenELD/issues) or join [Discord](https://discord.gg/YOUR_INVITE) to discuss before building something large.

```bash
python backend/manage.py check
cd frontend && npm run build
```


## License

Apache 2.0 — see [LICENSE](LICENSE).


<p align="center">
  <b>If OpenELD saves your fleet money, give it a star. That's how more drivers find it.</b><br><br>
  <a href="https://github.com/anukulKun/OpenELD/stargazers">⭐ Star OpenELD</a>
</p>

# OpenELD Backend

Django REST API, HOS planning engine, route calculation, and deployment entrypoint.

## Local Development (no Docker)

From the repo root, just run:

```bash
backend-dev.bat
```

This creates the virtual environment, installs dependencies, sets up your
`.env` file, runs database migrations, and starts the server - all in one
step. Safe to run again any time; it skips setup it's already done.

API runs at `http://127.0.0.1:8000/api`.

<details>
<summary>Manual setup (Mac/Linux, or if you want to do it by hand)</summary>

```bash
cd backend
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

</details>

## Important Folders

- `api/` - REST endpoints, serializers, models, and trip planning orchestration.
- `hos_calculator/` - Hours-of-service rules and log generation.
- `route_calculator/` - Routing and distance helpers.
- `eld_trip_planner/` - Django project settings, URLs, WSGI/ASGI entrypoints.

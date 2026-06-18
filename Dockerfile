FROM node:20-bookworm-slim AS app

WORKDIR /app/app
COPY app/package*.json ./
RUN npm install --legacy-peer-deps
COPY app/ ./
RUN npm run build

FROM python:3.12-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=app /app/app/build ./app_build

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn eld_trip_planner.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]

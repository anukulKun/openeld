# Contributing to OpenELD

Thanks for your interest. OpenELD is an open-source project and contributions are welcome — bug fixes, new features, documentation, and anything that makes it more useful for drivers and fleets.

## Before you start

Check the [open issues](https://github.com/anukulKun/openeld/issues) before starting work. If you want to build something that isn't already tracked, open an issue first so we can discuss the approach. This avoids wasted effort on PRs that won't merge.

## Setup

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
npm start
```

## Before opening a PR

Run these and make sure they pass:

```bash
# Backend
python backend/manage.py check

# Frontend
cd frontend && npm run build
```

## What we're looking for

Good contributions include:

- Bug fixes with a clear description of what was wrong and how you fixed it
- HOS engine improvements — especially the known limitations tracked in [#3](https://github.com/anukulKun/openeld/issues/3)
- Frontend fixes — the good first issue is [#2](https://github.com/anukulKun/openeld/issues/2)
- Better geocoding or routing fallbacks
- Documentation improvements

## What we won't merge

- Hardware ELD device integrations
- Features that require paid third-party APIs
- Changes that break the self-hosted, zero-API-key setup

## Pull request guidelines

- Keep PRs focused — one fix or feature per PR
- Write a clear description of what changed and why
- Reference the issue number if one exists (`Closes #2`)
- Don't bump version numbers in your PR

## Questions

Open an issue or join [Discord](https://discord.gg/YOUR_INVITE).

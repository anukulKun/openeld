# Contributing to OpenELD

Thanks for your interest. OpenELD is an open-source project and contributions are welcome: bug fixes, features, documentation, and anything that makes it more useful for drivers and fleets.

## Before You Start

Check the [open issues](https://github.com/anukulKun/OpenELD/issues) before starting work. If you want to build something that is not already tracked, open an issue first so we can discuss the approach.

## Setup

Backend, one command:

```bash
backend-dev.bat
```

Then, in a second terminal, the product app:

```bash
cd app
npm install
npm start
```

If you want to run the backend manually:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## Before Opening a PR

Run these checks and make sure they pass:

```bash
python backend/manage.py check
cd app && npm run build
```

## Good Contributions

- Bug fixes with a clear description of what was wrong and how you fixed it.
- HOS engine improvements, especially known limitations tracked in issues.
- Product app fixes that improve planning, log review, or driver workflows.
- Better geocoding or routing fallbacks.
- Documentation improvements.

## Out of Scope

- Hardware ELD device integrations.
- Features that require paid third-party APIs.
- Changes that break the self-hosted, zero-paid-key setup.

## Pull Request Guidelines

- Keep PRs focused on one fix or feature.
- Write a clear description of what changed and why.
- Reference the issue number if one exists, for example `Closes #2`.
- Do not bump version numbers in your PR.

## Questions

Open an issue or join [Discord](https://discord.gg/YOUR_INVITE).

# Contributing to OpenELD

This repo serves two different audiences, and they have different workflows.
Read the section that applies to you before doing anything:

- **[Part 1 — Contributing code upstream](#part-1--contributing-code-upstream)** —
  you want to send fixes/features back to this project.
- **[Part 2 — Running your own fork](#part-2--running-your-own-fork)** — you
  cloned this to deploy your own instance, and have no interest in sending
  changes back. **You can stop reading after Part 2.**

---

## Part 1 — Contributing code upstream

Thanks for your interest. OpenELD is an open-source project and contributions
are welcome: bug fixes, features, documentation, and anything that makes it
more useful for drivers and fleets.

### Before You Start

Check the [open issues](https://github.com/anukulKun/OpenELD/issues) before
starting work. If you want to build something that is not already tracked,
open an issue first so we can discuss the approach.

### Setup

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

### Before Opening a PR

Run these checks and make sure they pass:

```bash
python backend/manage.py check
cd app && npm run build
```

### Good Contributions

- Bug fixes with a clear description of what was wrong and how you fixed it.
- HOS engine improvements, especially known limitations tracked in issues.
- Product app fixes that improve planning, log review, or driver workflows.
- Better geocoding or routing fallbacks.
- Documentation improvements.

### Out of Scope

- Hardware ELD device integrations.
- Features that require paid third-party APIs.
- Changes that break the self-hosted, zero-paid-key setup.

### Pull Request Guidelines

- Keep PRs focused on one fix or feature.
- Write a clear description of what changed and why.
- Reference the issue number if one exists, for example `Closes #2`.
- Do not bump version numbers in your PR.
- Do **not** commit `.env` files, Firebase service-account JSON files, or any
  real credentials — ever.

### Questions

Open an issue or join [Discord](https://discord.gg/YOUR_INVITE).

---

## Part 2 — Running your own fork

You don't have to contribute anything back. If you cloned this repo to run
your own instance, here's how:

1. **Fork the repo** (or clone it and push to your own remote — you just need
   a repo you control).
2. **Configure your own services** — see [SETUP.md](SETUP.md). Everything you
   need to bring: optionally a Firebase project, optionally a Postgres
   database, optionally your own OSRM/Nominatim instances. There are no
   OpenELD-hosted secrets anywhere in this repo — nothing phones home.
3. **Rebrand your instance** — edit `app/src/config.js` and
   `backend/eld_trip_planner/config.py` for the app name, logo, carrier
   details, and filename/localStorage prefixes.
4. **Deploy** — follow the "Deploy it yourself" section in SETUP.md (any VPS
   with Docker, or Render + Vercel, or any other host using the same pattern).

### Keeping your fork up to date

To pull in upstream fixes without losing your own changes:

```bash
git remote add upstream https://github.com/anukulKun/OpenELD.git
git fetch upstream
git merge upstream/main
# resolve any conflicts (usually only in .env.example, SETUP.md, or docs)
```

Your `.env` files are gitignored, so upstream merges never touch your
credentials. Keep a close eye on conflicts in `backend/.env.example` if
upstream adds new env vars.

### Things to keep in mind when running your own fork

- `DJANGO_SECRET_KEY` must be unique to your instance — generate a fresh one
  (see SETUP.md).
- Your Firebase project's sign-in will only work for your own domains — add
  them to Firebase → Authentication → Authorized domains.
- Security issues in your fork are your responsibility to patch — watch
  upstream releases/commits and merge them regularly.

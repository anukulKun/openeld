#!/bin/bash
# Run this from your home directory (~) in PythonAnywhere Bash console
#
# Self-host your fork on PythonAnywhere. Set the three vars below before the
# first run, or pass them inline:
#   bash openeld/backend/setup_pythonanywhere.sh anukulKun openeld https://github.com/anukulKun/openeld.git
# Usage: cd ~ && bash openeld/backend/setup_pythonanywhere.sh

set -e

# --- Your values (edit these or pass as $1 $2 $3) ---
PA_USERNAME="${1:-anukulKun}"            # your PythonAnywhere username
APP_NAME="${2:-openeld}"                 # directory name on PythonAnywhere
REPO_URL="${3:-https://github.com/anukulKun/openeld.git}"  # your fork's clone URL

# Your public frontend origin(s) — comma-separated, used for CORS/CSRF.
# Leave FRONTEND_ORIGIN empty if you do not have a frontend yet.
FRONTEND_ORIGIN="${4:-}"
FRONTEND_HOSTS="${FRONTEND_ORIGIN//https:\/\//}"

echo "=== Pulling latest code ==="
if [ ! -d ~/$APP_NAME/.git ]; then
  git clone "$REPO_URL" ~/$APP_NAME
fi
cd ~/$APP_NAME
git pull
cd backend

echo "=== Creating virtualenv ==="
if [ ! -d venv ]; then
  python3 -m venv venv
fi
source venv/bin/activate

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Setting up .env ==="
cp .env.example .env
sed -i "s/DJANGO_SECRET_KEY=change-me-local/DJANGO_SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')/"
sed -i "s/DJANGO_DEBUG=True/DJANGO_DEBUG=False/"
sed -i "s/DJANGO_ALLOWED_HOSTS=.*/DJANGO_ALLOWED_HOSTS=.pythonanywhere.com,${FRONTEND_HOSTS}/"
sed -i "s|DJANGO_CORS_ALLOWED_ORIGINS=.*|DJANGO_CORS_ALLOWED_ORIGINS=${FRONTEND_ORIGIN}|"
sed -i "s|DJANGO_CSRF_TRUSTED_ORIGINS=.*|DJANGO_CSRF_TRUSTED_ORIGINS=https://${PA_USERNAME}.pythonanywhere.com,${FRONTEND_ORIGIN}|"

echo "=== Migrations ==="
python manage.py migrate

echo "=== Static files ==="
python manage.py collectstatic --noinput

echo ""
echo "=== Next steps (manual) ==="
echo "1. Go to Web tab in PythonAnywhere dashboard"
echo "2. Add a new web app -> Manual config -> Python 3.12"
echo "3. Set path to: /home/$PA_USERNAME/$APP_NAME/backend"
echo "4. Set virtualenv to: /home/$PA_USERNAME/$APP_NAME/backend/venv"
echo "5. WSGI file: Edit it and paste contents from wsgi.py"
echo "6. Static files URL: /static/ -> /home/$PA_USERNAME/$APP_NAME/backend/staticfiles"
echo "7. Reload web app"
echo ""
echo "Your app will be at: https://$PA_USERNAME.pythonanywhere.com"
echo "Health check: https://$PA_USERNAME.pythonanywhere.com/healthz/"
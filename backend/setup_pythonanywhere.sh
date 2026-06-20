#!/bin/bash
# Run this in PythonAnywhere Bash console to deploy OpenELD backend
# Usage: bash setup_pythonanywhere.sh

set -e

REPO_URL="https://github.com/anukulKun/openeld.git"
PA_USERNAME="anukulKun"
APP_NAME="openeld"

echo "=== Cloning repo ==="
cd ~
rm -rf $APP_NAME || true
git clone $REPO_URL
cd $APP_NAME/backend

echo "=== Creating virtualenv ==="
python3 -m venv venv
source venv/bin/activate

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Setting up .env ==="
cp .env.example .env
sed -i "s/DJANGO_SECRET_KEY=change-me-local/DJANGO_SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')/"
sed -i "s/DJANGO_DEBUG=True/DJANGO_DEBUG=False/"
sed -i "s/DJANGO_ALLOWED_HOSTS=.*/DJANGO_ALLOWED_HOSTS=.pythonanywhere.com,platform.openeld.vercel.app,openeld.vercel.app/"
sed -i "s|DJANGO_CORS_ALLOWED_ORIGINS=.*|DJANGO_CORS_ALLOWED_ORIGINS=https://platform.openeld.vercel.app,https://openeld.vercel.app|"
sed -i "s|DJANGO_CSRF_TRUSTED_ORIGINS=.*|DJANGO_CSRF_TRUSTED_ORIGINS=https://${PA_USERNAME}.pythonanywhere.com,https://platform.openeld.vercel.app,https://openeld.vercel.app|"

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

"""
Script to create a superuser for Django admin
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eld_trip_planner.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser 'admin' created successfully")
else:
    print("Superuser 'admin' already exists")

"""
Standalone script to create a superuser without Django environment
"""

import sqlite3
import hashlib
import json
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / 'db.sqlite3'


def hash_password(password):
    """Hash password using PBKDF2"""
    algorithm = 'pbkdf2_sha256'
    iterations = 320000
    salt = 'test'  # In production, generate random salt
    hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), iterations)
    return f"{algorithm}${iterations}${salt}${hash_obj.hex()}"


def create_superuser_standalone():
    """Create superuser directly in SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'

    hashed_password = hash_password(password)

    try:
        cursor.execute('''
            INSERT INTO auth_user (username, first_name, last_name, email, password, is_staff, is_active, is_superuser, last_login, date_joined)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ''', (username, '', '', email, hashed_password, 1, 1, 1, None))

        conn.commit()
        print(f"Superuser '{username}' created successfully")
    except sqlite3.IntegrityError:
        print(f"Superuser '{username}' already exists")
    finally:
        conn.close()


if __name__ == '__main__':
    if DB_PATH.exists():
        create_superuser_standalone()
    else:
        print(f"Database not found at {DB_PATH}")

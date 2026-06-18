"""
Test POST request to the API
"""

import requests
import json
from datetime import datetime

API_URL = 'http://127.0.0.1:8000/api/trips/'

test_data = {
    'driver_name': 'John Doe',
    'start_location': 'New York, NY',
    'pickup_location': 'Philadelphia, PA',
    'end_location': 'Boston, MA',
    'start_time': datetime.now().isoformat(),
    'hos_rules': '70-hour-8-day',
    'cycle_hours_used': 5.5,
}

try:
    response = requests.post(API_URL, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

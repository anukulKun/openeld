import uuid

from django.contrib.auth.models import User
from django.db import models


class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField(blank=True)
    name = models.CharField(max_length=255, blank=True, default='')
    ruleset = models.CharField(max_length=50, blank=True, default='70-hour/8-day')
    cycle_used_hours = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DriverProfile({self.firebase_uid})"


class Trip(models.Model):
    driver_name = models.CharField(max_length=255)
    start_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255, blank=True, null=True)
    end_location = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    hos_rules = models.CharField(max_length=50, default='70-hour-8-day')
    cycle_hours_used = models.FloatField(default=0.0)
    total_distance_miles = models.FloatField(default=0.0)
    total_driving_hours = models.FloatField(default=0.0)
    route_plan = models.JSONField(default=dict, blank=True)
    daily_logs = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    firebase_uid = models.CharField(max_length=128, db_index=True, blank=True, null=True)
    violation_risk = models.CharField(max_length=10, blank=True, default='')

    def __str__(self):
        return f"Trip: {self.driver_name} from {self.start_location} to {self.end_location}"

    class Meta:
        ordering = ['-created_at']


class TripRecord(models.Model):
    RISK_LOW = 'LOW'
    RISK_MEDIUM = 'MEDIUM'
    RISK_HIGH = 'HIGH'
    RISK_CHOICES = [
        (RISK_LOW, 'Low'),
        (RISK_MEDIUM, 'Medium'),
        (RISK_HIGH, 'High'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='trip_records')
    origin = models.CharField(max_length=255)
    pickup = models.CharField(max_length=255, blank=True, default='')
    destination = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    ruleset = models.CharField(max_length=50, default='70-hour/8-day')
    cycle_used_at_start = models.FloatField(default=0.0)
    total_miles = models.FloatField(null=True, blank=True)
    estimated_drive_hours = models.FloatField(null=True, blank=True)
    stops = models.JSONField(default=list, blank=True)
    daily_logs = models.JSONField(default=list, blank=True)
    violation_risk = models.CharField(max_length=10, choices=RISK_CHOICES, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TripRecord: {self.origin} -> {self.destination} ({self.created_at.date()})"

    class Meta:
        ordering = ['-created_at']

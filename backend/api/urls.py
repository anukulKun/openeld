from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverViewSet, TripViewSet, TripRecordViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'driver', DriverViewSet, basename='driver')
router.register(r'history', TripRecordViewSet, basename='history')

urlpatterns = [
    path('', include(router.urls)),
]

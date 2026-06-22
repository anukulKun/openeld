from datetime import datetime, timedelta
from uuid import uuid4

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .firebase_auth import FirebaseAuthentication

from hos_calculator import HOSCalculator, calculate_risk_score, normalize_ruleset
from route_calculator.route_calculator import get_osrm_route

from .geo import build_waypoints, geocode, route_distance, route_polyline
from .models import DriverProfile, Trip, TripRecord
from .planning import aware_datetime, build_compliance, build_summary, validate_plan_input
from .serializers import DriverSerializer, TripSerializer, TripRecordSerializer

DEPARTURE_WINDOWS = [
    ("now", lambda now, _: now),
    ("your_time", lambda _, entered: entered),
    ("plus_2", lambda _, entered: entered + timedelta(hours=2)),
    ("tomorrow_4am", lambda now, _: (now + timedelta(days=1)).replace(hour=4, minute=0, second=0, microsecond=0)),
    ("tomorrow_6am", lambda now, _: (now + timedelta(days=1)).replace(hour=6, minute=0, second=0, microsecond=0)),
]

DEPARTURE_LABELS = {
    "now": "Now",
    "your_time": "Your time",
    "plus_2": "+2 hours",
    "tomorrow_4am": "Tomorrow 4:00 AM",
    "tomorrow_6am": "Tomorrow 6:00 AM",
}


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    @action(detail=False, methods=["post"], url_path="plan")
    def plan(self, request):
        current_location = request.data.get("current_location") or request.data.get("start_location")
        pickup_location = request.data.get("pickup_location")
        dropoff_location = request.data.get("dropoff_location") or request.data.get("end_location")
        validation_error = validate_plan_input(request.data, current_location, pickup_location, dropoff_location)
        if validation_error:
            return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)

        current_cycle_hours = float(request.data.get("current_cycle_hours") or request.data.get("cycle_hours_used") or 0)
        driver_name = request.data.get("driver_name") or "Driver"
        hos_rules = normalize_ruleset(request.data.get("hos_rules") or "70-hour/8-day")
        start_time = request.data.get("start_time") or timezone.now().isoformat()

        start, pickup, dropoff = geocode(current_location), geocode(pickup_location), geocode(dropoff_location)
        for field, value, coords in [
            ("start_location", current_location, start),
            ("pickup_location", pickup_location, pickup),
            ("dropoff_location", dropoff_location, dropoff),
        ]:
            if coords is None:
                return Response({
                    "error": "location_not_found",
                    "field": field,
                    "message": f"Could not geocode '{value}' - please use a city and state format like 'Chicago, IL'",
                }, status=status.HTTP_400_BAD_REQUEST)

        route = get_osrm_route([(start[1], start[0]), (pickup[1], pickup[0]), (dropoff[1], dropoff[0])])
        polyline = route_polyline(route, [start, pickup, dropoff])
        total_distance_miles = route["distance"] / 1609.344 if route else route_distance(polyline)
        pickup_mile = route["legs"][0]["distance"] / 1609.344 if route and route.get("legs") else route_distance([start, pickup])

        calculator = HOSCalculator(hos_rules)
        daily_logs, planned_events = calculator.plan_trip(
            total_distance_miles=total_distance_miles,
            current_cycle_hours=current_cycle_hours,
            pickup_mile=pickup_mile,
            dropoff_mile=total_distance_miles,
            start_time=start_time,
            start_location=current_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
        )
        for log in daily_logs:
            log["driver_name"] = driver_name

        waypoints = build_waypoints(current_location, pickup_location, dropoff_location, start, pickup, dropoff, planned_events, polyline, total_distance_miles)
        total_on_duty = sum(log["hos_summary"]["on_duty_hours"] for log in daily_logs)
        total_driving_hours = total_distance_miles / HOSCalculator.AVG_SPEED_MPH
        summary = build_summary(daily_logs, planned_events, total_distance_miles, current_cycle_hours, start_time, calculator)
        compliance = build_compliance(daily_logs, summary)
        response = self._plan_response(
            current_location, pickup_location, dropoff_location, driver_name, start_time,
            hos_rules, calculator, total_distance_miles, total_driving_hours,
            total_on_duty, current_cycle_hours, polyline, waypoints, route, daily_logs,
            summary, compliance,
        )
        risk, detail = calculate_risk_score(response, planned_events)
        response["violation_risk"] = risk
        response["violation_detail"] = detail
        fb_uid = self._get_firebase_uid(request)
        trip = self._save_trip(response, current_location, pickup_location, dropoff_location, start_time, hos_rules, current_cycle_hours, driver_name, fb_uid, risk)
        response["trip_id"] = trip.id
        return Response(response)

    @action(detail=False, methods=["get"])
    def recent(self, request):
        fb_uid = self._get_firebase_uid(request)
        trips = Trip.objects.filter(firebase_uid=fb_uid)[:20] if fb_uid else Trip.objects.none()
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        trip = self.get_object()
        serializer = self.get_serializer(trip)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="logs")
    def logs(self, request, pk=None):
        return Response(self.get_object().daily_logs)

    @action(detail=False, methods=["post"], url_path="save-trail")
    def save_trail(self, request):
        trail = request.data.get("trail", [])
        if not isinstance(trail, list):
            return Response({"error": "invalid_trail", "message": "Trail must be an array of GPS points."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"saved": len(trail), "trip_id": request.data.get("trip_id")})

    def _plan_response(self, current_location, pickup_location, dropoff_location, driver_name, start_time, hos_rules, calculator, total_distance_miles, total_driving_hours, total_on_duty, current_cycle_hours, polyline, waypoints, route, daily_logs, summary, compliance):
        return {
            "trip_id": str(uuid4()),
            "trip_title": f"{current_location} \u2192 {pickup_location} \u2192 {dropoff_location}",
            "timezone": "UTC",
            "driver_name": driver_name,
            "start_location": current_location,
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "start_time": start_time,
            "hos_rules": hos_rules,
            "ruleset_config": calculator.config,
            "total_distance_miles": round(total_distance_miles, 1),
            "total_driving_hours": round(total_driving_hours, 2),
            "total_on_duty_hours": round(total_on_duty, 2),
            "total_days": len(daily_logs),
            "current_cycle_hours": current_cycle_hours,
            "remaining_cycle_hours": round(max(0, calculator.cycle_limit - current_cycle_hours - total_on_duty), 2),
            "route": {
                "polyline": polyline,
                "waypoints": waypoints,
                "estimated": bool(route.get("estimated")) if route else True,
                "label": f"Route: {current_location} \u2192 {pickup_location} \u2192 {dropoff_location} via I-55/I-40 | {'Estimated' if route and route.get('estimated') else 'OSRM'}",
            },
            "daily_logs": daily_logs,
            "summary": summary,
            **compliance,
        }

    def _get_firebase_uid(self, request):
        if hasattr(request, 'firebase_user') and request.firebase_user:
            return request.firebase_user.get('firebase_uid')
        if request.user.is_authenticated:
            profile = DriverProfile.objects.filter(user=request.user).first()
            if profile:
                return profile.firebase_uid
        return None

    def _save_trip(self, response, current_location, pickup_location, dropoff_location, start_time, hos_rules, current_cycle_hours, driver_name, firebase_uid=None, violation_risk=""):
        return Trip.objects.create(
            driver_name=driver_name,
            start_location=current_location,
            pickup_location=pickup_location,
            end_location=dropoff_location,
            start_time=aware_datetime(start_time),
            hos_rules=hos_rules,
            cycle_hours_used=current_cycle_hours,
            total_distance_miles=response["total_distance_miles"],
            total_driving_hours=response["total_driving_hours"],
            route_plan=response["route"],
            daily_logs=response["daily_logs"],
            firebase_uid=firebase_uid,
            violation_risk=violation_risk,
        )

    @action(detail=False, methods=["post"], url_path="optimize")
    def optimize(self, request):
        current_location = request.data.get("current_location") or request.data.get("start_location")
        pickup_location = request.data.get("pickup_location")
        dropoff_location = request.data.get("dropoff_location") or request.data.get("end_location")
        validation_error = validate_plan_input(request.data, current_location, pickup_location, dropoff_location)
        if validation_error:
            return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)

        current_cycle_hours = float(request.data.get("current_cycle_hours") or request.data.get("cycle_hours_used") or 0)
        hos_rules = normalize_ruleset(request.data.get("hos_rules") or "70-hour/8-day")
        start_time_str = request.data.get("start_time") or timezone.now().isoformat()
        entered_dt = aware_datetime(start_time_str)

        start, pickup, dropoff = geocode(current_location), geocode(pickup_location), geocode(dropoff_location)
        for field, value, coords in [
            ("start_location", current_location, start),
            ("pickup_location", pickup_location, pickup),
            ("dropoff_location", dropoff_location, dropoff),
        ]:
            if coords is None:
                return Response({
                    "error": "location_not_found",
                    "field": field,
                    "message": f"Could not geocode '{value}' - please use a city and state format like 'Chicago, IL'",
                }, status=status.HTTP_400_BAD_REQUEST)

        route = get_osrm_route([(start[1], start[0]), (pickup[1], pickup[0]), (dropoff[1], dropoff[0])])
        polyline = route_polyline(route, [start, pickup, dropoff])
        total_distance_miles = route["distance"] / 1609.344 if route else route_distance(polyline)
        pickup_mile = route["legs"][0]["distance"] / 1609.344 if route and route.get("legs") else route_distance([start, pickup])

        calculator = HOSCalculator(hos_rules)
        now = timezone.now()
        windows = []
        for key, time_fn in DEPARTURE_WINDOWS:
            dt = time_fn(now, entered_dt)
            label = DEPARTURE_LABELS[key]
            window = self._score_window(calculator, dt, label, current_location, pickup_location,
                                        dropoff_location, total_distance_miles, pickup_mile,
                                        current_cycle_hours)
            windows.append(window)

        recommended_index = self._find_recommended(windows)
        windows[recommended_index]["recommended"] = True
        return Response({"windows": windows, "recommended_index": recommended_index})

    def _score_window(self, calculator, dt, label, current_location, pickup_location,
                      dropoff_location, total_distance_miles, pickup_mile, current_cycle_hours):
        dt_str = dt.isoformat()
        daily_logs, planned_events = calculator.plan_trip(
            total_distance_miles=total_distance_miles,
            current_cycle_hours=current_cycle_hours,
            pickup_mile=pickup_mile,
            dropoff_mile=total_distance_miles,
            start_time=dt_str,
            start_location=current_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
        )
        for log in daily_logs:
            log["driver_name"] = "Driver"

        total_on_duty = sum(log["hos_summary"]["on_duty_hours"] for log in daily_logs)
        summary = build_summary(daily_logs, planned_events, total_distance_miles, current_cycle_hours, dt_str, calculator)
        compliance = build_compliance(daily_logs, summary)
        pseudo = {
            "compliance_status": compliance["compliance_status"],
            "violations": compliance.get("violations", []),
            "remaining_cycle_hours": round(max(0, calculator.cycle_limit - current_cycle_hours - total_on_duty), 2),
            "summary": summary,
            "total_distance_miles": total_distance_miles,
            "daily_logs": daily_logs,
            "ruleset_config": calculator.config,
        }
        risk, _ = calculate_risk_score(pseudo, planned_events)

        requires_restart = any(e.get("name") == "34-Hour Restart" for e in (planned_events or []))
        cycle_remaining = summary.get("cycle_remaining", pseudo["remaining_cycle_hours"])
        estimated_arrival = summary.get("eta") if risk != "CRITICAL" else None
        cycle_on_arrival = cycle_remaining if risk != "CRITICAL" else None

        return {
            "departure_label": label,
            "departure_time": dt_str,
            "violation_risk": risk,
            "cycle_remaining_on_arrival_hours": cycle_on_arrival,
            "requires_restart": requires_restart,
            "estimated_arrival": estimated_arrival,
            "recommended": False,
        }

    def _find_recommended(self, windows):
        rank = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
        best_idx = 0
        for i, w in enumerate(windows):
            cur_risk = rank.get(w["violation_risk"], 99)
            best_risk = rank.get(windows[best_idx]["violation_risk"], 99)
            if cur_risk < best_risk:
                best_idx = i
            elif cur_risk == best_risk:
                cur_arrival = w.get("estimated_arrival") or ""
                best_arrival = windows[best_idx].get("estimated_arrival") or ""
                if cur_arrival and best_arrival and cur_arrival < best_arrival:
                    best_idx = i
                elif not best_arrival and cur_arrival:
                    best_idx = i
        return best_idx


class DriverViewSet(viewsets.ViewSet):
    permission_classes = []

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        fb_user = getattr(request, 'firebase_user', None)
        if not fb_user:
            return Response({"error": "Unauthorized"}, status=401)

        profile = fb_user['profile']

        if request.method == "PATCH":
            serializer = DriverSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

        serializer = DriverSerializer(profile)
        return Response(serializer.data)


class TripRecordViewSet(viewsets.ModelViewSet):
    serializer_class = TripRecordSerializer
    authentication_classes = [FirebaseAuthentication]

    def get_queryset(self):
        fb_user = getattr(self.request, 'firebase_user', None)
        if not fb_user:
            return TripRecord.objects.none()
        return TripRecord.objects.filter(driver=fb_user['profile'])

    def perform_create(self, serializer):
        fb_user = getattr(self.request, 'firebase_user', None)
        if not fb_user:
            raise PermissionDenied("Authentication required")
        serializer.save(driver=fb_user['profile'])

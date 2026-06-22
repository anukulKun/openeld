"""
Violation Risk Scoring for HOS trip plans.

Scoring thresholds (named constants — adjust as needed):
  CRITICAL_MILES_REMAINING: If the trip has violations, it's CRITICAL.
  HIGH_CYCLE_REMAINING_HOURS: Less than this many cycle hours remaining on arrival → HIGH risk.
  HIGH_EXHAUSTION_MILES: Cycle exhausted within this many miles of dropoff → HIGH risk.
  MEDIUM_CYCLE_REMAINING_HOURS: Less than this many cycle hours remaining on arrival → MEDIUM risk.
"""

HIGH_CYCLE_REMAINING_HOURS = 0.5
HIGH_EXHAUSTION_MILES = 180.0
MEDIUM_CYCLE_REMAINING_HOURS = 2.0


def calculate_risk_score(plan_response, planned_events=None):
    """
    Score the violation risk of a trip plan.

    Args:
        plan_response: The dict returned by _plan_response (includes compliance_status,
                       violations, remaining_cycle_hours, summary, daily_logs, etc.)
        planned_events: The raw list of stop events from the HOS calculator (each with
                       'type', 'name', 'mile', etc.). Used to detect 34-hour restarts.

    Returns:
        tuple[str, str]: (risk_level, violation_detail)
            risk_level is one of 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    """
    compliance_status = plan_response.get("compliance_status", "COMPLIANT")
    violations = plan_response.get("violations", [])
    remaining = plan_response.get("remaining_cycle_hours", 0)
    summary = plan_response.get("summary", {})
    cycle_remaining = summary.get("cycle_remaining", remaining)
    total_distance = plan_response.get("total_distance_miles", 0)
    daily_logs = plan_response.get("daily_logs", [])
    ruleset_config = plan_response.get("ruleset_config", {})
    cycle_limit = ruleset_config.get("cycle", 70)

    last_cumulative = 0.0
    if daily_logs:
        last_log = daily_logs[-1]
        last_cumulative = last_log.get("hos_summary", {}).get("cumulative_cycle_hours", 0)

    needed_34h_restart = False
    exhaustion_mile = None
    if planned_events:
        for event in planned_events:
            if event.get("name") == "34-Hour Restart":
                needed_34h_restart = True
                exhaustion_mile = event.get("mile")
                break

    if compliance_status == "VIOLATION" and violations:
        first = violations[0]
        detail = _critical_detail(first, total_distance, daily_logs)
        return "CRITICAL", detail

    if cycle_remaining < HIGH_CYCLE_REMAINING_HOURS:
        detail = _high_remaining_detail(cycle_remaining, total_distance, last_cumulative)
        return "HIGH", detail

    if exhaustion_mile is not None and total_distance - exhaustion_mile <= HIGH_EXHAUSTION_MILES:
        detail = _high_exhaustion_detail(exhaustion_mile, total_distance)
        return "HIGH", detail

    if needed_34h_restart:
        detail = _medium_restart_detail(cycle_remaining)
        return "MEDIUM", detail

    if cycle_remaining < MEDIUM_CYCLE_REMAINING_HOURS:
        detail = _medium_remaining_detail(cycle_remaining)
        return "MEDIUM", detail

    return "LOW", _low_result(cycle_remaining)


def _critical_detail(first_violation, total_distance, daily_logs):
    day_info = ""
    if daily_logs:
        last = daily_logs[-1]
        cum = last.get("hos_summary", {}).get("cumulative_cycle_hours", 0)
        day_info = f" Cycle used exceeds {cum:.1f}h by trip end."
    return (
        f"Violation unavoidable: {first_violation}.{day_info}"
        f" The trip cannot be completed within HOS rules even with compliant stops."
    )


def _high_remaining_detail(cycle_remaining, total_distance, last_cumulative):
    minutes = int(cycle_remaining * 60)
    return (
        f"Trip completes with only {minutes}min of cycle remaining "
        f"({cycle_remaining:.1f}h) — critically tight. "
        f"Any delay could result in a violation."
    )


def _high_exhaustion_detail(exhaustion_mile, total_distance):
    miles_from_drop = total_distance - exhaustion_mile
    return (
        f"Your cycle will be exhausted approximately {int(round(miles_from_drop))} miles "
        f"from your dropoff. A 34-hour restart is required before continuing."
    )


def _medium_restart_detail(cycle_remaining):
    hours = int(cycle_remaining)
    minutes = int((cycle_remaining - hours) * 60)
    remaining_str = f"{hours}h {minutes}min of cycle remaining on arrival." if cycle_remaining > 0 else "No cycle hours remaining on arrival."
    return (
        f"A 34-hour restart is required en route. {remaining_str}"
    )


def _medium_remaining_detail(cycle_remaining):
    hours = int(cycle_remaining)
    minutes = int((cycle_remaining - hours) * 60)
    return (
        f"Trip completes with {hours}h {minutes}min of cycle remaining "
        f"({cycle_remaining:.1f}h) — tight but legal."
    )


def _low_result(cycle_remaining):
    hours = int(cycle_remaining)
    minutes = int((cycle_remaining - hours) * 60)
    return f"No violations — {hours}h {minutes}min of cycle remaining on arrival."

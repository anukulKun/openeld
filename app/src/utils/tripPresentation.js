import { STORAGE_PREFIX } from '../config';

export function buildStopRows(tripPlan) {
  return (tripPlan.route?.waypoints || [])
    .filter((point) => ['fuel', 'rest'].includes(point.type))
    .map((point) => {
      const isFuel = point.type === 'fuel';
      const isBreak = /break/i.test(point.name);
      return {
        icon: isFuel ? 'F' : isBreak ? '30' : '10',
        tone: isFuel ? 'fuel' : isBreak ? 'break' : 'rest',
        title: isFuel ? 'Fuel' : isBreak ? '30-min break' : '10-hour reset',
        location: point.location || point.name,
        mile: Math.round(point.cumulative_miles),
        time: point.arrival_time,
      };
    });
}

export function buildWarnings(tripPlan) {
  const violations = (tripPlan.violations || []).map((text) => ({ level: 'warning', text: humanizeComplianceMessage(text, tripPlan) }));
  const warnings = (tripPlan.warnings || []).map((text) => ({ level: 'warning', text: humanizeComplianceMessage(text, tripPlan) }));
  const info = (tripPlan.info || []).map((text) => ({ level: 'ok', text: humanizeComplianceMessage(text, tripPlan) }));
  return [...violations, ...warnings, ...info];
}

export function sumLogs(tripPlan, key) {
  return (tripPlan.daily_logs || []).reduce((total, log) => total + Number(log.hos_summary?.[key] || 0), 0);
}

export function hoursFor(log, status) {
  return (log.schedule || []).reduce((total, segment) => total + (segment.status === status ? segment.end_hour - segment.start_hour : 0), 0).toFixed(1);
}

export function driveLabel(log) {
  const parts = log.shift_drive_breakdown?.filter((hours) => hours > 0.01) || [log.hos_summary.driving_hours];
  if (parts.length > 1) return `Drive: ${parts.map((hours) => `${Number(hours).toFixed(1)}h`).join(' + ')}`;
  return `Drive: ${Number(parts[0] || 0).toFixed(1)}h`;
}

export function complianceBadge(tripPlan) {
  if (tripPlan.compliance_status === 'VIOLATION') return { className: 'violation', label: 'Violation', text: 'HOS violation detected - trip not safe to run' };
  if (tripPlan.warnings?.length) return { className: 'warning', label: 'Warning', text: 'HOS warning - review before dispatch' };
  return { className: 'ok', label: 'Compliant', text: 'All FMCSA rules satisfied' };
}

export function riskScore(tripPlan) {
  if (!tripPlan) return { level: 'green', label: 'LOW RISK', className: 'risk-green', message: 'No active trip planned yet.' };
  const cycleRemaining = Number(tripPlan.summary?.cycle_remaining ?? tripPlan.remaining_cycle_hours ?? 0);
  const hasViolation = tripPlan.compliance_status === 'VIOLATION' || (tripPlan.compliance?.status || '').toLowerCase() === 'violation' || (tripPlan.violations || []).length > 0;
  const hasWarning = (tripPlan.warnings || []).length > 0 || (tripPlan.compliance?.status || '').toLowerCase() === 'warning';
  if (hasViolation) {
    return {
      level: 'red',
      label: 'HIGH RISK',
      className: 'risk-red',
      message: firstComplianceMessage(tripPlan) || 'A legal hours violation is predicted on this route. Review the required stops before driving.',
    };
  }
  if (hasWarning || cycleRemaining < 10) {
    return {
      level: 'yellow',
      label: 'MEDIUM RISK',
      className: 'risk-yellow',
      message: firstComplianceMessage(tripPlan) || `Cycle time will be tight after this trip. About ${cycleRemaining.toFixed(1)} hours remain.`,
    };
  }
  return {
    level: 'green',
    label: 'LOW RISK',
    className: 'risk-green',
    message: `No violations predicted. About ${cycleRemaining.toFixed(1)} hours of cycle time remain after this trip.`,
  };
}

export function firstComplianceMessage(tripPlan) {
  const first = [...(tripPlan.violations || []), ...(tripPlan.warnings || []), ...(tripPlan.info || [])][0];
  return first ? humanizeComplianceMessage(first, tripPlan) : '';
}

export function humanizeComplianceMessage(text = '', tripPlan = {}) {
  const raw = String(text);
  const dateMatch = raw.match(/^(\d{4}-\d{2}-\d{2}):\s*(.*)$/);
  const message = dateMatch ? dateMatch[2] : raw;
  const dayLabel = dateMatch ? dayLabelForDate(tripPlan, dateMatch[1]) : '';

  if (/14-hour window has less than 2h remaining/i.test(message)) {
    return `${dayLabel || 'This day'} - Duty window nearly full. Less than 2 hours remain at a planned stop.`;
  }
  if (/driving exceeded/i.test(message)) {
    return `${dayLabel || 'This day'} - Driving time goes over the legal shift limit. Add a break or reset before continuing.`;
  }
  if (/14-hour window exceeded/i.test(message)) {
    return `${dayLabel || 'This day'} - Duty window is over the legal limit. Add a 10-hour reset before this point.`;
  }
  if (/70-hour cycle exceeded/i.test(message)) {
    return `${dayLabel || 'This day'} - Cycle limit is exceeded. Plan a 34-hour restart before this run.`;
  }
  const critical = raw.match(/Critical warning:\s*cycle hours remaining after trip:\s*([0-9.]+)h/i);
  if (critical) {
    return `Critical: Only ${Number(critical[1]).toFixed(1)} hours of cycle time left after this trip. Plan a 34-hour restart before your next run.`;
  }
  const cycle = raw.match(/Cycle hours remaining after trip:\s*([0-9.]+)h/i);
  if (cycle) {
    return `Cycle time is getting low. ${Number(cycle[1]).toFixed(1)} hours remain after this trip.`;
  }
  const planned = raw.match(/Trip planned with\s*(\d+)\s*sleeper resets?\s*and\s*(\d+)\s*mandatory breaks?/i);
  if (planned) {
    return `Plan includes ${planned[1]} sleeper resets and ${planned[2]} mandatory breaks.`;
  }
  return raw.replace(/^\d{4}-\d{2}-\d{2}:\s*/, '');
}

function dayLabelForDate(tripPlan, date) {
  const index = (tripPlan.daily_logs || []).findIndex((log) => log.date === date);
  return index >= 0 ? `Day ${index + 1}` : '';
}

export function cycleRemainingTone(hours) {
  if (hours < 3) return { tone: 'danger', label: 'Critical - near cycle limit' };
  if (hours < 10) return { tone: 'warning', label: 'Warning - monitor cycle hours' };
  return { tone: '', label: '70-hour cycle' };
}

export function readTripStorage(tripId, key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-${tripId || 'new'}-${key}`)) || fallback;
  } catch {
    return fallback;
  }
}

export function writeTripStorage(tripId, key, value) {
  localStorage.setItem(`openeld-${tripId || 'new'}-${key}`, JSON.stringify(value));
}

export function formatHours(hours) {
  const whole = Math.floor(Number(hours || 0));
  const minutes = Math.round((Number(hours || 0) - whole) * 60);
  return minutes ? `${whole}h ${minutes}m` : `${whole}h`;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function downloadJson(tripPlan) {
  const blob = new Blob([JSON.stringify(tripPlan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${STORAGE_PREFIX}-trip-${tripPlan.trip_id || 'plan'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

import React from 'react';
import RouteMap from './RouteMap';
import Stat from './Stat';
import RouteOverview from './RouteOverview';
import StopsTimeline from './StopsTimeline';
import DailyLogs from './DailyLogs';
import DriverConsole from './DriverConsole';
import HistoryPage from './HistoryPage';
import TripEmptyState from './TripEmptyState';
import { formatDateTime, formatHours, riskScore, sumLogs } from '../utils/tripPresentation';

const plannerTabs = [
  ['overview', 'Route Overview'],
  ['stops', 'Stops & Timeline'],
  ['logs', 'Daily Logs'],
];

function MainPages({ page, plannerTab, onPlannerTabChange, formData, liveFormData, onFormChange, onSubmit, fieldErrors, tripPlan, history, selectedHistoryId, onHistorySelect, loading, optimizerData, optimizerLoading, onUseDeparture, onUseOptimizerTime, onPlanNew, onPageChange, logoSrc, onDeleteTrip }) {
  if (page === 'dashboard') return <DriverConsole tripPlan={tripPlan} formData={formData} />;
  if (page === 'history') return <HistoryPage history={history} selectedHistoryId={selectedHistoryId} onHistorySelect={onHistorySelect} onDeleteTrip={onDeleteTrip} />;
  return (
    <TripPlanner
      tripPlan={tripPlan}
      formData={formData}
      liveFormData={liveFormData}
      onFormChange={onFormChange}
      onSubmit={onSubmit}
      fieldErrors={fieldErrors}
      activeTab={plannerTab}
      onTabChange={onPlannerTabChange}
      loading={loading}
      optimizerData={optimizerData}
      optimizerLoading={optimizerLoading}
      onUseDeparture={onUseDeparture}
      onUseOptimizerTime={onUseOptimizerTime}
      onPlanNew={onPlanNew}
      onPageChange={onPageChange}
      logoSrc={logoSrc}
    />
  );
}

function TripPlanner({ tripPlan, formData, liveFormData, onFormChange, onSubmit, fieldErrors, activeTab, onTabChange, loading, optimizerData, optimizerLoading, onUseDeparture, onUseOptimizerTime, onPlanNew, onPageChange, logoSrc }) {
  if (!tripPlan) {
    return !loading && <TripEmptyState />;
  }

  return (
    <section className="page-stack">
      <ActiveTripSummary tripPlan={tripPlan} onPageChange={onPageChange} onPlanNew={onPlanNew} onTabChange={onTabChange} />
      <RouteMap tripPlan={tripPlan} />
      <div className="panel-tabs">
        {plannerTabs.map(([id, label]) => (
          <button key={id} className={activeTab === id ? 'active' : ''} type="button" onClick={() => onTabChange(id)}>
            {label}{id === 'logs' ? ` (${tripPlan.daily_logs.length})` : ''}
          </button>
        ))}
      </div>
      <SummaryStats tripPlan={tripPlan} formData={formData} />
      <RiskBanner tripPlan={tripPlan} />
      <OptimizerPanel
        optimizerData={optimizerData}
        optimizerLoading={optimizerLoading}
        onUseTime={onUseOptimizerTime}
        formStartTime={formData?.start_time || liveFormData?.start_time}
      />
      {activeTab === 'overview' && <RouteOverview tripPlan={tripPlan} formData={formData} onUseDeparture={onUseDeparture} />}
      {activeTab === 'stops' && <StopsTimeline tripPlan={tripPlan} />}
      {activeTab === 'logs' && <DailyLogs tripPlan={tripPlan} formData={formData} />}
    </section>
  );
}

function ActiveTripSummary({ tripPlan, onPageChange, onPlanNew, onTabChange }) {
  const risk = riskScore(tripPlan);
  return (
    <section className="active-trip-summary">
      <strong>{tripPlan.trip_title || `${tripPlan.start_location} -> ${tripPlan.pickup_location} -> ${tripPlan.dropoff_location}`}</strong>
      <div className="mobile-summary-stats">
        <SummaryMini label="Distance" value={`${Math.round(tripPlan.total_distance_miles || 0)} mi`} />
        <SummaryMini label="Drive Time" value={formatHours(tripPlan.total_driving_hours)} />
        <SummaryMini label="Cycle Left" value={`${Number(tripPlan.summary?.cycle_remaining ?? tripPlan.remaining_cycle_hours ?? 0).toFixed(1)} hrs`} />
        <SummaryMini label="ETA" value={formatDateTime(tripPlan.summary?.eta)} />
      </div>
      <div className={`risk-pill ${risk.className}`}>{risk.label}</div>
      <div className="active-trip-actions">
        <button className="btn-primary" type="button" onClick={() => { onTabChange('logs'); onPageChange('planner'); }}>View My Logs</button>
        <button className="btn-secondary" type="button" onClick={() => onPageChange('dashboard')}>View Hours</button>
      </div>
      <button className="plan-new-link" type="button" onClick={onPlanNew}>Plan New Trip</button>
    </section>
  );
}

function RiskBanner({ tripPlan }) {
  const risk = tripPlan.violation_risk || (tripPlan.compliance_status === 'VIOLATION' ? 'CRITICAL' : '');
  const detail = tripPlan.violation_detail || '';
  if (!risk) return null;
  const config = {
    LOW: { className: 'risk-green', icon: '\u2713', label: 'Low Risk' },
    MEDIUM: { className: 'risk-yellow', icon: '\u26A0', label: 'Medium Risk' },
    HIGH: { className: 'risk-yellow', icon: '\u26A0', label: 'High Risk' },
    CRITICAL: { className: 'risk-red', icon: '\u2717', label: 'Critical \u2014 Violation Unavoidable' },
  };
  const cfg = config[risk] || config.CRITICAL;
  return (
    <div className={`risk-banner ${cfg.className}`}>
      <strong>{cfg.icon} {cfg.label}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}

function OptimizerPanel({ optimizerData, optimizerLoading, onUseTime, formStartTime }) {
  if (optimizerLoading) {
    return (
      <div className="optimizer-section">
        <div className="optimizer-header"><span>Departure Optimizer</span></div>
        <div className="optimizer-skeleton">
          {[1,2,3,4,5].map((i) => <div key={i} className="skeleton-row" />)}
        </div>
      </div>
    );
  }

  if (!optimizerData || !optimizerData.windows || optimizerData.windows.length === 0) return null;

  const windows = optimizerData.windows;
  const config = {
    LOW: { cls: 'risk-pill-green', label: 'Low' },
    MEDIUM: { cls: 'risk-pill-yellow', label: 'Medium' },
    HIGH: { cls: 'risk-pill-orange', label: 'High' },
    CRITICAL: { cls: 'risk-pill-red', label: 'Critical' },
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const isEntered = (departureTime) => {
    if (!formStartTime || !departureTime) return false;
    const entered = new Date(formStartTime).getTime();
    const dep = new Date(departureTime).getTime();
    return Math.abs(entered - dep) < 60000;
  };

  const formatRemaining = (hours) => {
    if (hours == null) return '—';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min remaining`;
  };

  return (
    <div className="optimizer-section">
      <div className="optimizer-header">
        <span>Departure Optimizer</span>
        <span className="optimizer-sub">Compare departure times</span>
      </div>
      <div className="optimizer-table-wrapper">
        <table className="optimizer-table">
          <thead>
            <tr>
              <th>Departure</th>
              <th>Time</th>
              <th>Risk</th>
              <th>Cycle Left</th>
              <th>Restart</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {windows.map((w, i) => {
              const cfg = config[w.violation_risk] || config.CRITICAL;
              const entered = isEntered(w.departure_time);
              return (
                <tr key={i} className={`optimizer-row ${entered ? 'entered-time' : ''} ${w.recommended ? 'recommended' : ''}`}>
                  <td className="opt-label">
                    <strong>{w.departure_label}</strong>
                    {w.recommended && <span className="rec-pill">Recommended</span>}
                  </td>
                  <td className="opt-time">{formatDateTime(w.departure_time)}</td>
                  <td><span className={`risk-pill ${cfg.cls}`}>{cfg.label}</span></td>
                  <td className="opt-cycle">{formatRemaining(w.cycle_remaining_on_arrival_hours)}</td>
                  <td className={`opt-restart ${w.requires_restart ? 'needs-restart' : ''}`}>{w.requires_restart ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="opt-use-btn" type="button" onClick={() => onUseTime(w.departure_time)}>Use this time</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="optimizer-cards">
          {windows.map((w, i) => {
            const cfg = config[w.violation_risk] || config.CRITICAL;
            const entered = isEntered(w.departure_time);
            return (
              <div key={i} className={`optimizer-card ${entered ? 'entered-time' : ''} ${w.recommended ? 'recommended' : ''}`}>
                <div className="opt-card-header">
                  <strong>{w.departure_label}</strong>
                  {w.recommended && <span className="rec-pill">Recommended</span>}
                </div>
                <div className="opt-card-body">
                  <div className="opt-card-row"><span>Time</span><span>{formatDateTime(w.departure_time)}</span></div>
                  <div className="opt-card-row"><span>Risk</span><span className={`risk-pill ${cfg.cls}`}>{cfg.label}</span></div>
                  <div className="opt-card-row"><span>Cycle Left</span><span>{formatRemaining(w.cycle_remaining_on_arrival_hours)}</span></div>
                  <div className="opt-card-row"><span>Restart</span><span className={w.requires_restart ? 'needs-restart' : ''}>{w.requires_restart ? 'Yes' : 'No'}</span></div>
                </div>
                <button className="opt-use-btn" type="button" onClick={() => onUseTime(w.departure_time)}>Use this time</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryStats({ tripPlan, formData }) {
  const onDuty = tripPlan.total_on_duty_hours || sumLogs(tripPlan, 'on_duty_hours');
  const cycleLimit = tripPlan.ruleset_config?.cycle || 70;
  const cycleLeft = cycleLimit - Number(formData.cycle_hours_used || tripPlan.current_cycle_hours || 0);
  const plannedStops = tripPlan.summary?.planned_stops || tripPlan.route.waypoints.length;
  return (
    <div className="stats-grid">
      <Stat label="Total Distance" value={Math.round(tripPlan.total_distance_miles)} suffix="mi" help="Route distance" />
      <Stat label="Drive Time" value={formatHours(tripPlan.total_driving_hours)} suffix="" help="Behind the wheel" />
      <Stat
        label="On-Duty Time"
        value={onDuty.toFixed(1)}
        suffix="hrs"
        help={onDuty > cycleLeft ? `Exceeds available cycle (${cycleLeft.toFixed(1)}h left)` : `${(cycleLeft - onDuty).toFixed(1)}h cycle remaining`}
        tone={onDuty > cycleLeft * 0.9 ? 'danger' : ''}
      />
      <Stat label="Log Sheets" value={tripPlan.daily_logs.length} suffix="days" help={`${plannedStops} planned stops`} />
    </div>
  );
}

function SummaryMini({ label, value }) {
  return <div><span>{label}</span><b>{value}</b></div>;
}

export default MainPages;

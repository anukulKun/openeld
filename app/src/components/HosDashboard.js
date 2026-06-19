import React from 'react';
import RouteMap from './RouteMap';
import Stat from './Stat';
import RouteOverview from './RouteOverview';
import StopsTimeline from './StopsTimeline';
import DailyLogs from './DailyLogs';
import DriverConsole from './DriverConsole';
import HistoryPage from './HistoryPage';
import PlannerView from './PlannerView';
import { formatDateTime, formatHours, riskScore, sumLogs } from '../utils/tripPresentation';

const plannerTabs = [
  ['overview', 'Route Overview'],
  ['stops', 'Stops & Timeline'],
  ['logs', 'Daily Logs'],
];

function MainPages({ page, plannerTab, onPlannerTabChange, formData, liveFormData, onFormChange, onSubmit, fieldErrors, tripPlan, history, selectedHistoryId, onHistorySelect, loading, onUseDeparture, onPlanNew, onPageChange }) {
  if (page === 'dashboard') return <DriverConsole tripPlan={tripPlan} formData={formData} />;
  if (page === 'history') return <HistoryPage history={history} selectedHistoryId={selectedHistoryId} onHistorySelect={onHistorySelect} />;
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
      onUseDeparture={onUseDeparture}
      onPlanNew={onPlanNew}
      onPageChange={onPageChange}
    />
  );
}

function TripPlanner({ tripPlan, formData, liveFormData, onFormChange, onSubmit, fieldErrors, activeTab, onTabChange, loading, onUseDeparture, onPlanNew, onPageChange }) {
  if (!tripPlan) {
    return !loading && (
      <section className="empty-state rich-empty mobile-planner-state">
        <div className="mobile-form-brand">OpenELD</div>
        <div className="empty-icon" aria-hidden="true" />
        <h1>Plan your compliant route</h1>
        <p>Enter your trip details to generate an FMCSA-compliant route plan with daily log sheets.</p>
        <div className="mobile-full-form">
          <PlannerView formData={liveFormData || formData} loading={loading} onFormChange={onFormChange} onSubmit={onSubmit} fieldErrors={fieldErrors} compactAction />
          <button className="load-recent-link" type="button" onClick={() => onPageChange('history')}>Load Recent Trip</button>
        </div>
      </section>
    );
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

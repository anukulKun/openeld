import React, { useState } from 'react';
import { buildWarnings, complianceBadge, formatDateTime, humanizeComplianceMessage } from '../utils/tripPresentation';
import RiskScoreBanner from './RiskScoreBanner';
import DepartureOptimizer from './DepartureOptimizer';

function RouteOverview({ tripPlan, formData, onUseDeparture }) {
  const [expanded, setExpanded] = useState(false);
  const warnings = buildWarnings(tripPlan);
  const badge = complianceBadge(tripPlan);

  return (
    <>
      <RiskScoreBanner tripPlan={tripPlan} />
      <DepartureOptimizer tripPlan={tripPlan} formData={formData} onUseDeparture={onUseDeparture} />
      <div className="overview-grid">
        <section className="compliance-card">
          <div className="section-title">Compliance Check</div>
          <button className={`${badge.className}-banner compliance-toggle`} type="button" onClick={() => setExpanded((open) => !open)}>
            <strong>{badge.label}</strong>
            <span>{badge.text}</span>
          </button>
          <div className="messages">
            {warnings.map((warning) => (
              <div className={`message ${warning.level}`} key={warning.text}>
                <b>{warning.level === 'ok' ? 'OK' : '!'}</b>
                <span>{warning.text}</span>
              </div>
            ))}
          </div>
          {expanded && <ComplianceDetails tripPlan={tripPlan} />}
        </section>
        <section className="summary-card">
          <div className="section-title">Operational Summary</div>
          <div className="summary-grid">
            <Summary label="ETA" value={formatDateTime(tripPlan.summary?.eta)} />
            <Summary label="Route Source" value={tripPlan.route?.estimated ? 'Estimated route' : 'OSRM route geometry'} />
            <Summary label="Fuel Stops" value={tripPlan.summary?.fuel_stops || 0} />
            <Summary label="Sleeper Resets" value={tripPlan.summary?.sleeper_resets || 0} />
            <Summary label="Breaks" value={tripPlan.summary?.breaks || 0} />
            <Summary label="Planned Stops" value={tripPlan.summary?.planned_stops || tripPlan.route.waypoints.length} />
          </div>
        </section>
      </div>
    </>
  );
}

function ComplianceDetails({ tripPlan }) {
  return (
    <div className="compliance-details">
      <DetailList title="Violations" items={tripPlan.violations} tripPlan={tripPlan} />
      <DetailList title="Warnings" items={tripPlan.warnings} tripPlan={tripPlan} />
      <DetailList title="Info" items={tripPlan.info} tripPlan={tripPlan} />
    </div>
  );
}

function DetailList({ title, items = [], tripPlan }) {
  return <div><strong>{title}</strong>{items.length ? items.map((item) => <span key={item}>{humanizeComplianceMessage(item, tripPlan)}</span>) : <span>None</span>}</div>;
}

function Summary({ label, value }) {
  return <div className="summary-tile"><span>{label}</span><strong>{value}</strong></div>;
}

export default RouteOverview;

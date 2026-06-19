import React, { useEffect, useState } from 'react';
import { planTrip } from '../utils/api';
import { formatDateTime, riskScore } from '../utils/tripPresentation';

function DepartureOptimizer({ tripPlan, formData, onUseDeparture }) {
  const baseRisk = riskScore(tripPlan);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!tripPlan || baseRisk.level === 'green') {
      setOptions([]);
      return undefined;
    }
    const base = new Date(formData.start_time || tripPlan.start_time);
    if (!Number.isFinite(base.getTime())) return undefined;
    setLoading(true);
    const shiftedForms = [4, 8].map((hours) => {
      const next = new Date(base);
      next.setHours(next.getHours() + hours);
      return { ...formData, start_time: toDateTimeLocal(next) };
    });
    Promise.all(shiftedForms.map((data) => planTrip(data).then((plan) => ({ data, plan })).catch(() => null)))
      .then((results) => {
        if (cancelled) return;
        const nowOption = { data: formData, plan: tripPlan };
        setOptions([nowOption, ...results.filter(Boolean)]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tripPlan, formData, baseRisk.level]);

  if (!tripPlan || baseRisk.level === 'green') return null;

  const best = [...options].sort((a, b) => riskRank(riskScore(a.plan).level) - riskRank(riskScore(b.plan).level))[0];

  return (
    <section className="departure-optimizer">
      <div className="section-title">Departure Options</div>
      {loading && <div className="optimizer-loading"><span className="spinner" /> Checking better departure times</div>}
      {!loading && options.map((option, index) => {
        const risk = riskScore(option.plan);
        return (
          <div className="departure-row" key={`${option.data.start_time}-${index}`}>
            <span>{index === 0 ? 'Leave now' : 'Leave at'} {formatDateTime(option.data.start_time)}</span>
            <b className={risk.className}>{risk.label}</b>
          </div>
        );
      })}
      {best && (
        <button className="btn-primary" type="button" onClick={() => onUseDeparture(best.data.start_time)}>
          Use {formatDateTime(best.data.start_time)} departure
        </button>
      )}
    </section>
  );
}

function riskRank(level) {
  return { green: 1, yellow: 2, red: 3 }[level] || 4;
}

function toDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default DepartureOptimizer;

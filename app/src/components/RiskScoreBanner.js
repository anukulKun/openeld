import React from 'react';
import { riskScore } from '../utils/tripPresentation';

function RiskScoreBanner({ tripPlan }) {
  const risk = riskScore(tripPlan);
  return (
    <section className={`risk-banner ${risk.className}`}>
      <div>
        <strong>{risk.label}</strong>
        <p>{risk.message}</p>
      </div>
    </section>
  );
}

export default RiskScoreBanner;


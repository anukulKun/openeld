'use client';

import Reveal from './Reveal';

const ROWS = [
  { feature: 'Monthly cost', them: '$150-200', us: '$0' },
  { feature: 'Proprietary hardware', them: 'Required', us: 'Not needed' },
  { feature: 'Data ownership', them: "Vendor's servers", us: 'Your server' },
  { feature: 'Source code access', them: 'Closed', us: 'MIT licensed' },
  { feature: 'Self-hostable', them: 'Not available', us: 'Yes, in 60s' },
  { feature: 'AI co-driver included', them: 'Add-on tier', us: 'Built in' },
];

export default function Compare() {
  return (
    <section className="band" id="compare">
      <div className="band-inner container">
        <Reveal>
          <div className="section-eyebrow-row">
            <span className="eyebrow">Why open source</span>
            <span className="eyebrow-line" />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="section-head-row">
            <h2 className="section-title">
              Samsara charges $200/mo.
              <br />
              <span className="soft">OpenELD doesn&rsquo;t charge at all.</span>
            </h2>
            <p className="section-desc">
              Small fleets and owner-operators shouldn&rsquo;t need a SaaS contract to
              stay compliant.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="compare-table">
            <div className="compare-row-head">
              <span>Capability</span>
              <span>Typical ELD SaaS</span>
              <span>OpenELD</span>
            </div>
            {ROWS.map((r) => (
              <div className="compare-row" key={r.feature}>
                <span className="compare-feature">{r.feature}</span>
                <span className="compare-val them">{r.them}</span>
                <span className="compare-val us">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {r.us}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .band { padding: 88px 0; }
        .section-eyebrow-row { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; }
        .eyebrow {
          font-family: var(--font-mono); font-size: 11px; font-weight: 500;
          letter-spacing: 1.4px; text-transform: uppercase; color: var(--muted); flex-shrink: 0;
        }
        .eyebrow-line { flex: 1; height: 1px; background: var(--hairline-strong); }
        .section-head-row { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 48px; align-items: end; }
        .section-title { font-size: 38px; font-weight: 600; letter-spacing: -1.1px; line-height: 1.12; color: var(--ink); }
        .soft { color: var(--muted); }
        .section-desc { font-size: 16px; color: var(--body); line-height: 1.7; }

        .compare-table { border-top: 1px solid var(--hairline); border-radius: var(--r-md); overflow: hidden; }
        .compare-row-head, .compare-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 24px;
          padding: 20px 24px; border-bottom: 1px solid var(--hairline); align-items: center;
        }
        .compare-row-head {
          color: var(--muted); font-size: 12px; letter-spacing: 0.6px; text-transform: uppercase;
          font-family: var(--font-mono); background: var(--footer-bg);
        }
        .compare-row { background: var(--canvas); transition: background .15s; }
        .compare-row:hover { background: var(--footer-bg); }
        .compare-feature { font-size: 15px; color: var(--ink); font-weight: 500; }
        .compare-val { font-size: 14.5px; }
        .compare-val.them { color: var(--muted); }
        .compare-val.us {
          color: var(--success); font-weight: 600;
          display: inline-flex; align-items: center; gap: 7px;
        }

        @media (max-width: 1024px) {
          .section-head-row { grid-template-columns: 1fr; gap: 18px; }
          .compare-row-head, .compare-row { grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; padding: 18px 16px; }
        }
        @media (max-width: 640px) {
          .band { padding: 56px 0; }
          .section-title { font-size: 27px; letter-spacing: -0.8px; }
          .compare-feature { font-size: 13px; }
          .compare-val { font-size: 12.5px; }
        }
      `}</style>
    </section>
  );
}

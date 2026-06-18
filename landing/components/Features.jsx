'use client';

import Reveal from './Reveal';

const FEATURES = [
  {
    title: 'FMCSA-compliant HOS engine',
    desc: '70-hr/8-day, 60-hr/7-day, and Alaska rulesets. Drive window and cycle remaining calculated in real time.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" stroke="var(--accent)" />
      </svg>
    ),
  },
  {
    title: 'Multi-stop route planning',
    desc: 'Current location, pickup, dropoff. Fuel stops and rest events inserted automatically against your live HOS.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 18c0-4 2.5-6 7-6s7 2 7 6" />
        <circle cx="10" cy="7" r="3.2" stroke="var(--accent)" />
      </svg>
    ),
  },
  {
    title: 'FMCSA log sheet generation',
    desc: 'Print-ready daily logs drawn to spec. One-tap PDF export, sent to dispatch without leaving the app.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="var(--accent)" />
      </svg>
    ),
  },
  {
    title: 'Plain-English violations',
    desc: 'No compliance jargon. "Break due in 22 minutes" — not "14-hour window threshold breach."',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3L3 19h18L12 3z" />
        <path d="M12 10v4" stroke="var(--accent)" />
        <circle cx="12" cy="16.5" r="0.6" fill="var(--accent)" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Live GPS tracking',
    desc: 'Real-time position, speed, and distance to next stop — on the phone a driver already carries.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="9" r="2.6" />
        <path d="M12 11.5v8.5M8 16.5l4 3.5 4-3.5" stroke="var(--accent)" />
      </svg>
    ),
  },
  {
    title: 'Fully self-hostable',
    desc: 'Docker Compose. Your server, your data. No telemetry sent anywhere you didn&rsquo;t put it.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="10" width="16" height="10" rx="1.5" />
        <path d="M8 10V7a4 4 0 018 0v3" stroke="var(--accent)" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className="band" id="product">
      <div className="band-inner container">
        <Reveal>
          <div className="section-eyebrow-row">
            <span className="eyebrow">Core capabilities</span>
            <span className="eyebrow-line" />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="section-head-row">
            <h2 className="section-title">
              Everything a driver needs.
              <br />
              <span className="soft">Nothing more.</span>
            </h2>
            <p className="section-desc">
              No bloated dispatch dashboard. No per-seat pricing. Just the tools that
              keep a truck legal and a driver home on time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon-box">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
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
          letter-spacing: 1.4px; text-transform: uppercase; color: var(--muted);
          flex-shrink: 0;
        }
        .eyebrow-line { flex: 1; height: 1px; background: var(--hairline-strong); }

        .section-head-row { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 48px; align-items: end; }
        .section-title { font-size: 38px; font-weight: 600; letter-spacing: -1.1px; line-height: 1.12; color: var(--ink); }
        .soft { color: var(--muted); }
        .section-desc { font-size: 16px; color: var(--body); line-height: 1.7; }

        .feature-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--hairline); border-radius: var(--r-md);
          overflow: hidden; background: var(--hairline); gap: 1px;
        }
        .feature-card { background: var(--canvas); padding: 30px; transition: background .2s; }
        .feature-card:hover { background: var(--white); }
        .feature-icon-box {
          width: 36px; height: 36px; border-radius: var(--r-sm);
          background: var(--white); border: 1px solid var(--hairline-strong);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; color: var(--ink);
        }
        .feature-title { font-size: 15.5px; font-weight: 600; color: var(--ink); margin-bottom: 9px; }
        .feature-desc { font-size: 14px; color: var(--body); line-height: 1.6; }

        @media (max-width: 1024px) {
          .section-head-row { grid-template-columns: 1fr; gap: 18px; }
          .feature-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .band { padding: 56px 0; }
          .section-title { font-size: 27px; letter-spacing: -0.8px; }
          .feature-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

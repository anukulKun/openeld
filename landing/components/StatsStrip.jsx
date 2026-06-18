'use client';

import Reveal from './Reveal';

const STATS = [
  { value: '$0', accent: true, caption: 'per month, forever' },
  { value: '3', caption: 'HOS rulesets supported' },
  { value: '60s', caption: 'to self-host via Docker' },
  { value: '0', caption: 'vendor lock-ins' },
];

export default function StatsStrip() {
  return (
    <section className="stats-strip">
      <div className="stats-grid container">
        {STATS.map((s, i) => (
          <Reveal key={s.caption} delay={i * 60}>
            <div className="stat-cell">
              <div className="stat-num">
                {s.accent ? <span className="accent-num">{s.value}</span> : s.value}
              </div>
              <div className="stat-cap">{s.caption}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <style jsx>{`
        .stats-strip {
          border-top: 1px solid var(--hairline);
          border-bottom: 1px solid var(--hairline);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .stat-cell {
          padding: 32px 28px;
          border-right: 1px solid var(--hairline);
        }
        .stats-grid > :global(div:first-child) .stat-cell {
          padding-left: 0;
        }
        .stats-grid > :global(div:last-child) .stat-cell {
          border-right: none;
          padding-right: 0;
        }
        .stat-num {
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -1px;
          color: var(--ink);
        }
        .accent-num {
          color: var(--accent);
        }
        .stat-cap {
          font-size: 13px;
          color: var(--body);
          margin-top: 6px;
        }
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .stat-cell {
            padding: 24px 16px;
          }
          .stat-num {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
}

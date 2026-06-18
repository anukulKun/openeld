'use client';

import Reveal from './Reveal';

export default function Hero() {
  return (
    <section className="band hero" id="hero">
      <div className="band-inner container">
        <div className="hero-grid">
          <Reveal>
            <div className="hero-copy">
              <div className="hero-kicker">Open-source ELD trip planning</div>
              <h1 className="hero-title">
                Plan legal trips.
                <br />
                <span className="soft">Generate clean logs.</span>
              </h1>
              <p className="hero-sub">
                OpenELD calculates HOS limits, fuel stops, rest breaks, and FMCSA-style
                daily log sheets from a simple pickup and dropoff route.
              </p>
              {/* <p className="hero-cmd-line">
                Self-host in one command — <code>docker compose up --build</code>
              </p> */}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="hero-panel" aria-label="OpenELD route planning preview">
              <div className="panel-top">
                <span>Trip plan</span>
                <strong>70h / 8d</strong>
              </div>
              <div className="route-line">
                <span className="dot start" />
                <span className="rail" />
                <span className="dot pickup" />
                <span className="rail" />
                <span className="dot end" />
              </div>
              <div className="route-labels">
                <span>Chicago</span>
                <span>Denver</span>
                <span>Phoenix</span>
              </div>
              <div className="metric-grid">
                <div>
                  <span className="metric-label">Drive time</span>
                  <strong>18h 40m</strong>
                </div>
                <div>
                  <span className="metric-label">Break due</span>
                  <strong>3h 12m</strong>
                </div>
                <div>
                  <span className="metric-label">Fuel stops</span>
                  <strong>2</strong>
                </div>
                <div>
                  <span className="metric-label">Logs</span>
                  <strong>3 days</strong>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <style jsx>{`
        .hero { padding: 120px 0 88px; }
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 56px;
          align-items: center;
        }
        .hero-kicker {
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          color: var(--accent);
          margin-bottom: 18px;
        }
        .hero-title {
          font-size: 56px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1.08;
          color: var(--ink);
          max-width: 720px;
        }
        .soft { color: var(--muted); }
        .hero-sub {
          font-size: 17px;
          color: var(--body);
          line-height: 1.7;
          max-width: 520px;
          margin-top: 22px;
        }
        .hero-cmd-line {
          font-size: 14.5px;
          color: var(--body);
          margin-top: 24px;
        }
        .hero-cmd-line code {
          font-family: var(--font-mono);
          background: var(--footer-bg);
          border: 1px solid var(--hairline-strong);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 13px;
          color: var(--ink);
        }
        .hero-panel {
          background: var(--white);
          border: 1px solid var(--hairline-strong);
          border-radius: var(--r-lg);
          padding: 28px;
          box-shadow: 0 18px 50px rgba(28, 27, 23, 0.08);
        }
        .panel-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--body);
          font-size: 14px;
          margin-bottom: 34px;
        }
        .panel-top strong {
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 12px;
        }
        .route-line {
          display: grid;
          grid-template-columns: 16px 1fr 16px 1fr 16px;
          align-items: center;
          gap: 8px;
        }
        .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid var(--canvas);
          box-shadow: 0 0 0 1px var(--hairline-strong);
        }
        .start { background: var(--success); }
        .pickup { background: var(--accent); }
        .end { background: var(--ink); }
        .rail { height: 2px; background: var(--hairline-strong); }
        .route-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          color: var(--body);
          font-size: 13px;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          overflow: hidden;
          border: 1px solid var(--hairline);
          border-radius: var(--r-sm);
          background: var(--hairline);
          margin-top: 34px;
        }
        .metric-grid > div {
          background: var(--canvas);
          padding: 18px;
        }
        .metric-label {
          display: block;
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 6px;
        }
        .metric-grid strong { font-size: 18px; color: var(--ink); }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 36px; }
        }
        @media (max-width: 640px) {
          .hero { padding: 64px 0 48px; }
          .hero-title { font-size: 34px; }
          .hero-panel { padding: 22px; }
          .metric-grid strong { font-size: 16px; }
        }
      `}</style>
    </section>
  );
}

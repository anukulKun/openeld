'use client';

import Reveal from './Reveal';

const STEPS = [
  {
    n: '1',
    title: 'Clone the repo',
    desc: 'Apache-licensed source code you can fork, modify, and run for your own fleet.',
  },
  {
    n: '2',
    title: 'Review environment',
    desc: 'Copy .env.example if you want custom database, host, or security settings.',
  },
  {
    n: '3',
    title: 'Launch',
    desc: 'One command builds the web frontend and serves it with the Django API.',
  },
];

export default function Install() {
  return (
    <section className="band" id="install">
      <div className="band-inner container">
        <Reveal>
          <div className="section-eyebrow-row">
            <span className="eyebrow">Self-hosting</span>
            <span className="eyebrow-line" />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="section-head-row">
            <h2 className="section-title">
              Running on your own
              <br />
              <span className="soft">server in three steps.</span>
            </h2>
            <p className="section-desc">
              No managed cloud, no monthly invoice, no account required to get started.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="install-grid">
            <div className="install-steps">
              {STEPS.map((s) => (
                <div className="install-step" key={s.n}>
                  <div className="install-step-icon">{s.n}</div>
                  <div>
                    <div className="install-step-title">{s.title}</div>
                    <div className="install-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="terminal-card">
              <div className="terminal-dots">
                <span className="td-r" />
                <span className="td-y" />
                <span className="td-g" />
              </div>
              <div><span className="prompt">$</span> git clone github.com/anukulKun/OpenELD</div>
              <div><span className="prompt">$</span> cd OpenELD</div>
              <div><span className="prompt">$</span> docker compose up --build</div>
              <div className="out">&nbsp;</div>
              <div className="out">ok backend running on :8000</div>
              <div className="out">ok web frontend served by Django</div>
              <div className="out">ok ready for local planning</div>
            </div>
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
        .section-title { font-size: 38px; font-weight: 600; letter-spacing: 0; line-height: 1.12; color: var(--ink); }
        .soft { color: var(--muted); }
        .section-desc { font-size: 16px; color: var(--body); line-height: 1.7; }

        .install-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: center; }
        .install-steps { display: flex; flex-direction: column; }
        .install-step { display: flex; gap: 18px; padding: 22px 0; border-bottom: 1px solid var(--hairline); }
        .install-step:last-child { border-bottom: none; }
        .install-step-icon {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: var(--white); border: 1px solid var(--hairline-strong);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-size: 12px; font-weight: 500; color: var(--ink);
        }
        .install-step-title { font-size: 15.5px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .install-step-desc { font-size: 13.5px; color: var(--body); line-height: 1.6; }

        .terminal-card {
          background: var(--panel-dark); border-radius: var(--r-md);
          padding: 26px; font-family: var(--font-mono); font-size: 13px;
          line-height: 1.9; color: rgba(255,255,255,0.65);
        }
        .terminal-dots { display: flex; gap: 6px; margin-bottom: 16px; }
        .terminal-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .td-r { background: #D0645C; } .td-y { background: #D8A93D; } .td-g { background: #5FAF74; }
        .terminal-card :global(.prompt) { color: #5FAF74; }
        .terminal-card :global(.out) { color: rgba(255,255,255,0.4); }

        @media (max-width: 1024px) {
          .section-head-row { grid-template-columns: 1fr; gap: 18px; }
          .install-grid { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 640px) {
          .band { padding: 56px 0; }
          .section-title { font-size: 27px; }
        }
      `}</style>
    </section>
  );
}

'use client';

const GITHUB_URL = 'https://github.com/anukulKun/OpenELD';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#product' },
      { label: 'Miles AI', href: '#miles' },
      { label: 'Live demo', href: process.env.NEXT_PUBLIC_APP_URL || 'https://platform.openeld.vercel.app' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'GitHub', href: GITHUB_URL },
      { label: 'Docs', href: `${GITHUB_URL}/blob/main/README.md` },
      { label: 'Contributing', href: `${GITHUB_URL}/blob/main/CONTRIBUTING.md` },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discussions', href: `${GITHUB_URL}/discussions` },
      { label: 'Issues', href: `${GITHUB_URL}/issues` },
      { label: 'Releases', href: `${GITHUB_URL}/releases` },
    ],
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="footer-panel container">
        <div className="footer-top">
          <div>
            <div className="footer-brand-row">
              <img src="/logo-light.png" alt="OpenELD" className="logo-light" />
              <img src="/logo-dark.png" alt="OpenELD" className="logo-dark" />
            </div>
            <p className="footer-tagline">
              The open-source ELD trip planner. Free forever. Built for the drivers,
              not the carriers.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div
              className={`footer-col ${col.title === 'Community' ? 'footer-col-community' : ''}`}
              key={col.title}
            >
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 OpenELD · MIT License</span>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="footer-github">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Star on GitHub
          </a>
        </div>
      </div>

      <style jsx>{`
        footer { padding: 0 32px 40px; }
        .footer-panel {
          background: var(--footer-bg); border-radius: var(--r-xl);
          padding: 48px 56px 32px;
        }
        .footer-top {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr) minmax(120px, 0.72fr);
          column-gap: clamp(28px, 3.5vw, 48px);
          row-gap: 40px;
          padding-bottom: 40px;
        }
        .footer-brand-row { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
        .footer-brand-row img { width: 100px; height: auto; display: block; }
        [data-theme='light'] .logo-dark { display: none; }
        [data-theme='dark'] .logo-light { display: none; }
        .footer-tagline { font-size: 14px; color: var(--body); max-width: 250px; line-height: 1.6; }
        .footer-col h4 { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 18px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .footer-col ul li a { font-size: 14px; color: var(--body); transition: color .15s; }
        .footer-col ul li a:hover { color: var(--ink); }
        .footer-col-community {
          justify-self: start;
          text-align: left;
          margin-right: 0;
        }

        .footer-bottom {
          border-top: 1px solid var(--hairline-strong); padding-top: 22px;
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr) minmax(120px, 0.72fr);
          column-gap: clamp(28px, 3.5vw, 48px);
          align-items: center;
          font-size: 13px; color: var(--muted);
        }
        .footer-copy { grid-column: 1 / 2; }
        .footer-github {
          grid-column: 4 / 5;
          justify-self: start;
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--ink); font-weight: 600; font-size: 13px;
          transition: opacity .15s;
        }
        .footer-github:hover { opacity: 0.7; }

        @media (max-width: 1024px) {
          .footer-top { grid-template-columns: 1fr 1fr; gap: 28px; }
          .footer-bottom { grid-template-columns: 1fr 1fr; gap: 28px; }
          .footer-col-community { justify-self: start; text-align: left; margin-right: 0; }
          .footer-copy { grid-column: 1 / 2; }
          .footer-github { grid-column: 2 / 3; }
        }
        @media (max-width: 640px) {
          footer { padding: 0 20px 32px; }
          .footer-panel { padding: 36px 24px 24px; border-radius: var(--r-lg); }
          .footer-top { grid-template-columns: 1fr; gap: 26px; }
          .footer-bottom { grid-template-columns: 1fr; gap: 14px; text-align: left; }
          .footer-copy { grid-column: 1; }
          .footer-github { grid-column: 1; }
        }
      `}</style>
    </footer>
  );
}

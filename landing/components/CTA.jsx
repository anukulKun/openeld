'use client';
import Button from './Button';

import Reveal from './Reveal';

const GITHUB_URL = 'https://github.com/anukulKun/OpenELD';
const APP_URL = 'https://openeld.onrender.com';

export default function CTA() {
  return (
    <section className="cta-section container">
      <Reveal>
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">
              Stop renting your
              <br />
              compliance software.
            </h2>
            <p className="cta-sub">
              Open the app, plan a route, generate a log sheet. No account needed to
              start.
            </p>
            <div className="cta-actions">
              <Button href={APP_URL} target="_blank" variant="accent" size="lg">
                Open the app
              </Button>
              <Button
                href={GITHUB_URL}
                target="_blank"
                variant="outline"
                size="lg"
                className="cta-outline"
              >
                Self-host for free
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
      <style jsx>{`
        .cta-section { padding: 88px 32px; }
        .cta-card {
          background: var(--panel-dark); border-radius: var(--r-xl);
          padding: 72px 60px; text-align: center; position: relative; overflow: hidden;
        }
        .cta-card::before {
          content: ''; position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
          width: 680px; height: 380px; background: radial-gradient(ellipse, rgba(200,80,31,0.2), transparent 70%);
        }
        .cta-content { position: relative; z-index: 1; }
        .cta-title { font-size: 42px; font-weight: 600; letter-spacing: -1.2px; line-height: 1.1; color: var(--canvas); margin-bottom: 14px; }
        .cta-sub { font-size: 16px; color: rgba(250,249,242,0.55); margin-bottom: 32px; }
        .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .cta-actions :global(.cta-outline) {
          border-color: rgba(250,249,242,0.22) !important;
          color: #FAF9F2 !important;
        }
        @media (max-width: 640px) {
          .cta-section { padding: 56px 20px; }
          .cta-card { padding: 44px 24px; }
          .cta-title { font-size: 28px; }
        }
      `}</style>
    </section>
  );
}

'use client';

import Reveal from './Reveal';

export default function MilesAI() {
  return (
    <section className="band" id="miles">
      <div className="band-inner container">
        <Reveal>
          <div className="miles-band">
            <div className="miles-grid">
              <div>
                <div className="miles-eyebrow">Miles · AI co-driver</div>
                <h2 className="miles-title">
                  Ask it like you&rsquo;d ask a dispatcher who actually likes you.
                </h2>
                <p className="miles-desc">
                  Miles reads your cycle hours, your route, and your deadline — then
                  answers in plain language, by voice or text.
                </p>
                <div className="voice-bar">
                  <div className="voice-bars">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="voice-text">&ldquo;Can I make Denver by six?&rdquo;</div>
                </div>
              </div>

              <div className="chat-stack">
                <div className="chat-row user">
                  <div className="chat-pill user-msg">Can I make Denver by 6pm?</div>
                </div>
                <div className="chat-row">
                  <div className="chat-pill miles-msg">
                    You&rsquo;ve used <span className="hl">9h 20m</span> of your 14-hour
                    window. At this pace you&rsquo;ll land around{' '}
                    <span className="hl">8:40pm</span> — tight.
                    <br />
                    <br />
                    Your <span className="warn">30-min break</span> is due in 40
                    minutes. Take it in Salida and you&rsquo;ll still clear Denver with
                    2h to spare.
                  </div>
                </div>
                <div className="chat-row user">
                  <div className="chat-pill user-msg">What if I skip it?</div>
                </div>
                <div className="chat-row">
                  <div className="chat-pill miles-msg">
                    <span className="warn">Don&rsquo;t.</span> Past 8 consecutive
                    hours, the break&rsquo;s mandatory. A roadside check between here
                    and Denver puts you out of service.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .band { padding: 88px 0; }
        .miles-band {
          background: var(--panel-dark); color: var(--canvas);
          border-radius: var(--r-xl); padding: 60px;
          position: relative; overflow: hidden;
        }
        .miles-band::before {
          content: ''; position: absolute; top: -30%; right: -10%;
          width: 480px; height: 480px; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,80,31,0.16), transparent 70%);
        }
        .miles-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 52px; position: relative; z-index: 1; align-items: center; }
        .miles-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; color: #D88A3F; margin-bottom: 18px; }
        .miles-title { font-size: 34px; font-weight: 600; letter-spacing: -0.9px; line-height: 1.15; color: var(--canvas); margin-bottom: 18px; }
        .miles-desc { font-size: 15.5px; color: rgba(250,249,242,0.6); line-height: 1.7; margin-bottom: 26px; }

        .voice-bar {
          display: flex; align-items: center; gap: 14px;
          background: rgba(250,249,242,0.05); border: 1px solid rgba(250,249,242,0.1);
          border-radius: var(--r-pill); padding: 11px 18px; max-width: 340px;
        }
        .voice-bars { display: flex; align-items: center; gap: 3px; height: 16px; }
        .voice-bars span { width: 3px; border-radius: 2px; background: #D88A3F; animation: voicewave 1.2s ease-in-out infinite; }
        .voice-bars span:nth-child(1){height:40%;animation-delay:0s}
        .voice-bars span:nth-child(2){height:100%;animation-delay:.15s}
        .voice-bars span:nth-child(3){height:60%;animation-delay:.3s}
        .voice-bars span:nth-child(4){height:90%;animation-delay:.45s}
        .voice-bars span:nth-child(5){height:50%;animation-delay:.6s}
        @keyframes voicewave { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        .voice-text { font-size: 13px; color: rgba(250,249,242,0.65); }

        .chat-stack { display: flex; flex-direction: column; gap: 12px; }
        .chat-row { display: flex; gap: 12px; }
        .chat-row.user { justify-content: flex-end; }
        .chat-pill { border-radius: 14px; padding: 13px 17px; font-size: 14px; line-height: 1.55; max-width: 380px; }
        .chat-pill.user-msg { background: rgba(250,249,242,0.08); color: var(--canvas); border-top-right-radius: 4px; }
        .chat-pill.miles-msg { background: var(--canvas); color: var(--ink); border-top-left-radius: 4px; }
        .chat-pill.miles-msg :global(.hl) { color: var(--accent); font-weight: 600; }
        .chat-pill.miles-msg :global(.warn) { color: #B45309; font-weight: 600; }

        @media (max-width: 1024px) {
          .miles-grid { grid-template-columns: 1fr; gap: 32px; }
          .miles-band { padding: 36px; }
        }
        @media (max-width: 640px) {
          .band { padding: 56px 0; }
          .miles-title { font-size: 25px; }
          .miles-band { padding: 26px; border-radius: var(--r-lg); }
          .voice-bar { max-width: 100%; }
        }
      `}</style>
    </section>
  );
}

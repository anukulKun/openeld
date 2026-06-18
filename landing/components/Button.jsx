'use client';

export default function Button({
  href,
  children,
  variant = 'solid',
  size = 'md',
  target,
  onClick,
  style,
  className = '',
}) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      target={target}
      className={`btn btn-${variant} btn-${size} ${className}`}
      style={style}
    >
      {children}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-weight: 600;
          border-radius: var(--r-pill);
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s, border-color 0.15s,
            box-shadow 0.2s;
          white-space: nowrap;
        }
        .btn:active {
          transform: scale(0.97);
        }
        .btn-md {
          font-size: 14.5px;
          padding: 0 20px;
          height: 42px;
        }
        .btn-lg {
          font-size: 15px;
          padding: 0 26px;
          height: 48px;
        }
        .btn-outline {
          background: transparent;
          color: var(--ink);
          border-color: var(--hairline-strong);
        }
        .btn-outline:hover {
          border-color: var(--ink);
          background: var(--white);
        }
        .btn-solid {
          background: var(--ink);
          color: var(--canvas);
        }
        .btn-solid:hover {
          opacity: 0.88;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
        }
        .btn-accent {
          background: var(--accent);
          color: #ffffff;
        }
        .btn-accent:hover {
          background: var(--accent-deep);
          box-shadow: 0 4px 14px rgba(200, 80, 31, 0.28);
        }
      `}</style>
    </Tag>
  );
}

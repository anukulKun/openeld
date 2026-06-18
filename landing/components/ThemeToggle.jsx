'use client';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="theme-toggle"
    >
      {isDark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5z" />
        </svg>
      )}
      <style jsx>{`
        .theme-toggle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid var(--hairline-strong);
          background: transparent;
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .theme-toggle:hover {
          border-color: var(--ink);
          background: var(--white);
        }
      `}</style>
    </button>
  );
}

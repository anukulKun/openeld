'use client';

import { useEffect, useState } from 'react';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#miles', label: 'Miles AI' },
  { href: '#install', label: 'Self-host' },
  { href: '#compare', label: 'Compare' },
];

const GITHUB_URL = 'https://github.com/anukulKun/OpenELD';
const APP_URL = '/app';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner container">
          <a href="#" className="nav-logo">
            <svg className="nav-logo-mark" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--ink)" />
              <path
                d="M9 20.5L13 11.5H16L13.5 17.5H19L14 23.5L15.5 19H11.5L9 20.5Z"
                fill="var(--accent)"
              />
            </svg>
            OpenELD
          </a>

          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <ThemeToggle />
            <Button href={GITHUB_URL} target="_blank" variant="outline">
              GitHub
            </Button>
            <Button href={APP_URL} target="_blank" variant="solid">
              Open app
            </Button>
          </div>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        <div className="mobile-menu-actions">
          <ThemeToggle />
          <Button href={GITHUB_URL} target="_blank" variant="outline" className="grow">
            GitHub
          </Button>
        </div>
        <Button href={APP_URL} target="_blank" variant="solid" className="grow">
          Open app
        </Button>
      </div>

      <style jsx>{`
        nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: color-mix(in srgb, var(--canvas) 90%, transparent);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s, background-color 0.25s;
        }
        nav.scrolled {
          border-bottom-color: var(--hairline);
        }
        .nav-inner {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.2px;
          color: var(--ink);
        }
        .nav-logo-mark {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 34px;
          list-style: none;
        }
        .nav-links a {
          font-size: 14.5px;
          font-weight: 500;
          color: var(--body);
          transition: color 0.15s;
        }
        .nav-links a:hover {
          color: var(--ink);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink);
          padding: 8px;
        }
        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }
          .nav-actions :global(.btn-outline) {
            display: none;
          }
          .nav-hamburger {
            display: flex;
          }
        }
        .mobile-menu {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--canvas);
          z-index: 99;
          padding: 24px 32px;
          flex-direction: column;
          gap: 4px;
        }
        .mobile-menu.open {
          display: flex;
        }
        .mobile-menu a {
          font-size: 18px;
          font-weight: 500;
          color: var(--ink);
          padding: 16px 0;
          border-bottom: 1px solid var(--hairline);
        }
        .mobile-menu-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }
        .mobile-menu :global(.grow) {
          flex: 1;
        }
        .mobile-menu :global(.btn-solid) {
          margin-top: 12px;
        }
      `}</style>
    </>
  );
}

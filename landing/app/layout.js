import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'OpenELD - Open-Source ELD Trip Planner & HOS Compliance',
  description:
    'Plan routes, enforce FMCSA HOS rules, and generate daily log sheets. Free, self-hosted, no subscription — built for owner-operators and small fleets.',
  openGraph: {
    title: 'OpenELD - Open-Source ELD Trip Planner',
    description:
      'Plan routes, enforce HOS rules, generate FMCSA log sheets. Free, self-hosted, no SaaS contract.',
    url: 'https://openeld.com',
    siteName: 'OpenELD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenELD - Open-Source ELD Trip Planner',
    description:
      'Plan routes, enforce HOS rules, generate FMCSA log sheets. Free, self-hosted, no SaaS contract.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = window.localStorage.getItem('openeld-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'QueueForge — Registration Operations Platform',
    template: '%s · QueueForge',
  },
  description:
    'QueueForge is a registration operations platform for managing capacity, duplicate registrations, waitlists, cancellations, decision traces, and registration workflows.',
  applicationName: 'QueueForge',
  keywords: [
    'registration operations',
    'waitlist management',
    'capacity management',
    'registration workflow',
    'audit trail',
    'queue management',
  ],
  authors: [{ name: 'QueueForge' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'QueueForge — Registration Operations Platform',
    description:
      'Deterministic registration engine with capacity, waitlists, cancellations, decision traces, and auditability.',
    siteName: 'QueueForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QueueForge — Registration Operations Platform',
    description:
      'Deterministic registration engine with capacity, waitlists, cancellations, decision traces, and auditability.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E1B24',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
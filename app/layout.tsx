import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ScrollToTop from '@/components/ui/ScrollToTop';
import StickyNewsletterBar from '@/components/ui/StickyNewsletterBar';
import RecentlyViewedTracker from '@/components/ui/RecentlyViewedTracker';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
// NewsletterPopup removed 2026-04-19 — audit found 4 CTAs/page was oppressive.
// Remaining surfaces: footer form, HeroNewsletterCTA, StickyNewsletterBar, EndOfArticleCTA, InlineNewsletterCTA.

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F0F0F',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thehumorindex.com'),
  icons: {
    icon: '/favicon-400.png',
    apple: '/favicon-400.png',
  },
  title: {
    default: "The Humor Index — The Science of What's Funny",
    template: '%s | The Humor Index',
  },
  description: 'AI-powered comedy analytics ranking every joke in television history. Data-driven leaderboards for the funniest shows, episodes, and characters.',
  openGraph: {
    title: 'The Humor Index',
    description: "The definitive science of what's funny. AI-analyzed rankings of every joke in sitcom history.",
    url: 'https://www.thehumorindex.com',
    siteName: 'The Humor Index',
    type: 'website',
    images: [
      {
        // Dynamic OG card renders at the correct 1.91:1 (1200×630) social aspect.
        url: "/api/og?title=The%20Humor%20Index&subtitle=" + encodeURIComponent("The science of what's funny"),
        width: 1200,
        height: 630,
        alt: 'The Humor Index — Comedy Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thehumorindex',
    title: 'The Humor Index',
    description: "The definitive science of what's funny.",
    images: ["/api/og?title=The%20Humor%20Index&subtitle=" + encodeURIComponent("The science of what's funny")],
  },
  alternates: {
    canonical: 'https://www.thehumorindex.com/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  // Search Console / Bing verification. Set these env vars in Vercel (Project →
  // Settings → Environment Variables) and the tags render automatically. DNS
  // TXT verification (Vercel → Domains) is an alternative that needs no code.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-brand-dark text-brand-text-primary min-h-screen flex flex-col font-sans`}>
        <Nav />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'The Humor Index',
            url: 'https://www.thehumorindex.com',
            logo: 'https://www.thehumorindex.com/favicon-400.png',
            description: 'AI-powered comedy analytics ranking every joke in television history.',
            sameAs: [
              'https://x.com/thehumorindex',
              'https://instagram.com/thehumorindex',
              'https://tiktok.com/@thehumorindex',
              'https://www.reddit.com/user/thehumorindex',
            ],
          }) }}
        />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
        <StickyNewsletterBar />
        <RecentlyViewedTracker />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

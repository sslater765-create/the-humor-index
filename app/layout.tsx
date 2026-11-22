import AdLoader from '@/components/ads/AdLoader';
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
import { SITE_URL } from '@/lib/site';
import { DnaProvider } from '@/components/comedy-dna/DnaProvider';
import { getComedyDnaFingerprints, getDnaBaseline } from '@/lib/data';
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
  metadataBase: new URL(`${SITE_URL}`),
  icons: {
    icon: '/favicon-400.png',
    apple: '/favicon-400.png',
  },
  title: {
    default: 'The Humor Index: Box Scores for Comedy',
    template: '%s | The Humor Index',
  },
  description: 'AI-powered comedy analytics: every joke in the sitcoms and comedy movies we cover, scored and ranked. Leaderboards for the funniest shows, episodes, movies and characters.',
  openGraph: {
    title: 'The Humor Index',
    description: "Every joke in the sitcoms and comedy movies we cover, scored by AI and ranked.",
    url: `${SITE_URL}`,
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
    description: "Every comedy joke, scored and ranked.",
    images: ["/api/og?title=The%20Humor%20Index&subtitle=" + encodeURIComponent("The science of what's funny")],
  },
  alternates: {
    canonical: `${SITE_URL}/`,
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Comedy DNA: show fingerprints + pool baseline, ~2KB, so any page can show a
  // visitor's match % or record a pick.
  const [dnaFingerprints, dnaBaseline] = await Promise.all([getComedyDnaFingerprints(), getDnaBaseline()]);
  return (
    <html lang="en">
      <head>
        {/* While ads are off, the plain tag stays so AdSense can verify the site.
            Once NEXT_PUBLIC_ADS_ON=1, AdLoader loads it only after a person interacts. */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && process.env.NEXT_PUBLIC_ADS_ON !== '1' && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-brand-dark text-brand-text-primary min-h-screen flex flex-col font-sans`}>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && process.env.NEXT_PUBLIC_ADS_ON === '1' && <AdLoader client={process.env.NEXT_PUBLIC_ADSENSE_ID} />}
        <Nav />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'The Humor Index',
            url: `${SITE_URL}`,
            logo: `${SITE_URL}/favicon-400.png`,
            description: 'AI-powered comedy analytics: every joke in the sitcoms and comedy movies we cover, scored and ranked.',
            sameAs: [
              'https://x.com/thehumorindex',
              'https://instagram.com/thehumorindex',
              'https://tiktok.com/@thehumorindex',
              'https://www.reddit.com/user/thehumorindex',
            ],
          }) }}
        />
        <DnaProvider fingerprints={dnaFingerprints} baseline={dnaBaseline}>
          <main className="flex-1">{children}</main>
        </DnaProvider>
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

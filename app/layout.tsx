import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ScrollToTop from '@/components/ui/ScrollToTop';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F0F0F',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://thehumorindex.com'),
  icons: {
    icon: '/favicon-400.png',
    apple: '/favicon-400.png',
  },
  title: {
    default: "The Humor Index — The Science of What's Funny",
    template: '%s | The Humor Index',
  },
  description: 'AI-powered comedy analytics ranking every joke in television history. Data-driven leaderboards for the funniest shows, episodes, and characters.',
  keywords: ['comedy analytics', 'funniest sitcoms ranked', 'sitcom rankings', 'best TV comedy', 'joke analysis', 'humor score', 'funniest episodes'],
  openGraph: {
    title: 'The Humor Index',
    description: "The definitive science of what's funny. AI-analyzed rankings of every joke in sitcom history.",
    url: 'https://thehumorindex.com',
    siteName: 'The Humor Index',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1500,
        height: 500,
        alt: 'The Humor Index — Comedy Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thehumorindex',
    title: 'The Humor Index',
    description: "The definitive science of what's funny.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com',
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
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

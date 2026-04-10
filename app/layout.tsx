import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: "The Humor Index — The Science of What's Funny",
  description: 'Data-driven rankings of the funniest shows, episodes, and characters in television history.',
  openGraph: {
    title: 'The Humor Index',
    description: "The definitive science of what's funny.",
    url: 'https://thehumorindex.com',
    siteName: 'The Humor Index',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thehumorindex',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-dark text-brand-text-primary min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

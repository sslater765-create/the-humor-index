import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import InlineNewsletterCTA from '@/components/ui/InlineNewsletterCTA';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Humor Index Insider: The Waitlist',
  description: 'A paid tier for people who want the full data: every joke score, new shows before they go public, and the State of Comedy report. Join the waitlist.',
  alternates: { canonical: `${SITE_URL}/insider/` },
};

// The free site stays free. Insider is planned, not launched: this page
// collects a waitlist (tagged utm_source=insider-waitlist in Beehiiv) so we
// know whether enough people want it before we build billing.
const PERKS = [
  { title: 'Every joke, downloadable', blurb: 'The full joke-level data for every show and film: each line, its craft and impact grades, its type, the three runs behind it. The public files stop at show and episode level.' },
  { title: 'New shows a week early', blurb: 'Each newly scored show, with its rank and tier, a week before it goes on the public board.' },
  { title: 'The State of Comedy', blurb: 'A yearly report: what got funnier, what got denser, how streaming comedy compares with network, and which shows the model and people disagree on most.' },
  { title: 'Your requests first', blurb: 'Insider votes on the next show count double, and a quarterly pick is scored on request.' },
  { title: 'The weekly data note', blurb: 'One finding a week from the data, with the numbers and the method, in the inbox.' },
];

export default function InsiderPage() {
  return (
    <div>
      <PageHeader label="Insider" title="For people who want the whole spreadsheet" subtitle="The leaderboard, show pages and games stay free. Insider is a paid tier we are planning for readers who want everything underneath them." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-xl border border-brand-border bg-brand-card p-5">
              <p className="text-brand-text-primary font-medium mb-1">{p.title}</p>
              <p className="text-sm text-brand-text-secondary leading-relaxed">{p.blurb}</p>
            </div>
          ))}
        </div>
        <InlineNewsletterCTA
          heading="Join the Insider waitlist"
          sub="We launch Insider once enough people ask for it. Waitlist members hear first and get the launch price. Nothing is charged by joining."
          source="insider-waitlist"
        />
        <p className="text-sm text-brand-text-muted leading-relaxed">
          Already free: the <Link href="/data" className="text-brand-gold hover:underline">public data files</Link>, the{' '}
          <Link href="/methodology" className="text-brand-gold hover:underline">full method</Link> and every{' '}
          <Link href="/changelog" className="text-brand-gold hover:underline">change to a score</Link>. Insider adds depth, never paywalls a ranking.
        </p>
      </div>
    </div>
  );
}

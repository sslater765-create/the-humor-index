import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { getPeople, getPerson } from '@/lib/people';
import { formatIndex } from '@/lib/scoring';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPeople()).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getPerson(params.slug);
  if (!p) return {};
  return {
    title: `${p.name}: Every Episode Ranked by the Humor Index`,
    description: `${p.name}'s ${p.episodes.length} credited episodes across ${p.shows.join(', ')}, ranked joke by joke. Average Humor Index ${formatIndex(p.avg)}.`,
    alternates: { canonical: `${SITE_URL}/people/${p.slug}/` },
  };
}

export default async function PersonPage({ params }: { params: { slug: string } }) {
  const p = await getPerson(params.slug);
  if (!p) notFound();
  const roles = [p.writerCount ? `wrote ${p.writerCount}` : '', p.directorCount ? `directed ${p.directorCount}` : ''].filter(Boolean).join(' and ');
  return (
    <div>
      <PageHeader label="People" title={p.name}
        subtitle={`${roles.charAt(0).toUpperCase() + roles.slice(1)} episode${p.episodes.length === 1 ? '' : 's'} we've scored, across ${p.shows.join(', ')}. Average Humor Index ${formatIndex(p.avg)}, ${p.plus >= 0 ? '+' : ''}${p.plus.toFixed(1)} against the show’s average episode.`} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <ol className="space-y-2.5">
          {p.episodes.map((e, i) => (
            <li key={`${e.showSlug}-${e.season}-${e.episode}-${e.role}`}>
              <Link href={`/shows/${e.showSlug}/${e.season}/${e.episode}/`}
                className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
                <span className="font-mono text-sm text-brand-text-muted w-6">{i + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-brand-text-primary truncate">{e.title}</span>
                  <span className="block text-xs text-brand-text-muted">{e.show} · S{e.season}E{e.episode} · {e.role === 'writer' ? 'Writer' : 'Director'}</span>
                </span>
                <span className="font-mono text-lg text-brand-gold">{formatIndex(e.hi)}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm"><Link href="/people" className="text-brand-gold hover:underline">All writers and directors →</Link></p>
      </div>
    </div>
  );
}

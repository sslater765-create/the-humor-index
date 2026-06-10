import Link from 'next/link';
import { getSiteStats } from '@/lib/siteStats';
import { formatIndex } from '@/lib/scoring';
import { SITE_URL } from '@/lib/site';
import { pageMeta, breadcrumbJsonLd } from '@/lib/seo';
import CopyBlock from '@/components/ui/CopyBlock';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'The Data — Open Comedy Dataset & Embeddable Badge | The Humor Index',
  description:
    'The Humor Index is open data. Download the per-show, per-episode, and per-joke scores as JSON, embed the live leaderboard on your site, and cite the numbers with attribution.',
  path: '/data',
});

const FILES = [
  { path: '/data/shows.json', name: 'shows.json', desc: 'Show-level leaderboard: Humor Index, JPM, craft, impact, CIs, metadata.' },
  { path: '/data/top-jokes.json', name: 'top-jokes.json', desc: 'The highest-scoring individual lines across every scored show.' },
  { path: '/data/comedy-dna.json', name: 'comedy-dna.json', desc: 'Per-show joke-type fingerprints (18 comedic dimensions).' },
  { path: '/data/recommendations.json', name: 'recommendations.json', desc: '"If you like X" — nearest-neighbour show recommendations.' },
  { path: '/data/search-index.json', name: 'search-index.json', desc: 'Searchable index of scored jokes with show/episode references.' },
];

export default async function DataPage() {
  const stats = await getSiteStats();

  const embedSnippet =
    `<iframe src="${SITE_URL}/api/embed?theme=light&limit=10"\n        width="420" height="380" frameborder="0"\n        title="The Humor Index — sitcom rankings"\n        style="border:1px solid #e5e5e5;border-radius:12px;max-width:100%">\n</iframe>`;

  const citation =
    `The Humor Index, "Sitcom comedy rankings" (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}). ${SITE_URL}. Accessed ${new Date().toISOString().slice(0, 10)}.`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'The Data', path: '/data' }])) }}
      />

      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">Open Data</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">The data behind the Index</h1>
        <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
          Every number on this site is computed by one pipeline, run the same way across{' '}
          {stats.showCount} shows — about {stats.totalEpisodes.toLocaleString()} episodes and{' '}
          {stats.totalJokes.toLocaleString()} individually scored jokes. It’s original, proprietary
          data, and we’re happy for you to use it: download it, embed it, or cite it with attribution.
        </p>
      </header>

      {/* Embed badge */}
      <section className="mb-12">
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Embed the live leaderboard</h2>
        <p className="text-sm text-brand-text-muted mb-5">
          Drop the current rankings on your blog or wiki. It updates automatically as we score new shows.
        </p>
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-3">
            <iframe
              src={`${SITE_URL}/api/embed?theme=dark&limit=8`}
              width={400}
              height={340}
              title="The Humor Index leaderboard preview"
              className="w-full rounded-lg"
              style={{ border: 'none' }}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Paste this anywhere</p>
            <CopyBlock code={embedSnippet} label="Copy embed" />
            <p className="text-[11px] text-brand-text-muted mt-3">
              Params: <code className="text-brand-text-secondary">theme=light|dark</code> ·{' '}
              <code className="text-brand-text-secondary">limit=1–50</code>. The badge links back here.
            </p>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="mb-12">
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Download the dataset</h2>
        <p className="text-sm text-brand-text-muted mb-5">
          Raw JSON, served straight from the site. Per-show episode and character files live under{' '}
          <code className="text-brand-text-secondary">/data/&lt;slug&gt;/</code>.
        </p>
        <div className="space-y-2">
          {FILES.map(f => (
            <a
              key={f.path}
              href={f.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors group"
            >
              <span className="font-mono text-xs text-brand-gold shrink-0">JSON</span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-sm text-brand-text-primary group-hover:text-brand-gold truncate">{f.name}</span>
                <span className="block text-xs text-brand-text-muted truncate">{f.desc}</span>
              </span>
              <span className="text-brand-text-muted group-hover:text-brand-gold shrink-0">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* Current snapshot (also helps AI answer engines) */}
      <section className="mb-12">
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-4">Current leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-text-muted text-xs uppercase tracking-widest">
                <th className="text-left py-2 font-normal">#</th>
                <th className="text-left py-2 font-normal">Show</th>
                <th className="text-right py-2 font-normal">Humor Index</th>
                <th className="text-right py-2 font-normal hidden sm:table-cell">Episodes</th>
              </tr>
            </thead>
            <tbody>
              {stats.leaderboard.map((s, i) => (
                <tr key={s.slug} className="border-b border-brand-border/50">
                  <td className="py-2 font-mono text-brand-text-muted">{i + 1}</td>
                  <td className="py-2"><Link href={`/shows/${s.slug}`} className="text-brand-text-primary hover:text-brand-gold">{s.name}</Link></td>
                  <td className="py-2 text-right font-mono text-brand-gold">{formatIndex(s.humor_index)}</td>
                  <td className="py-2 text-right font-mono text-brand-text-muted hidden sm:table-cell">{s.total_episodes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Citation */}
      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Cite it</h2>
        <p className="text-sm text-brand-text-muted mb-4">
          Using a figure in an article, paper, or video? Attribute it to The Humor Index. AI answer
          engines can read our <Link href="/llms.txt" className="text-brand-gold hover:underline">/llms.txt</Link> and{' '}
          <Link href="/methodology" className="text-brand-gold hover:underline">methodology</Link>.
        </p>
        <CopyBlock code={citation} label="Copy citation" />
      </section>

      <p className="text-xs text-brand-text-muted">
        Questions about licensing or a bulk export? <a href="mailto:sam@thehumorindex.com" className="text-brand-gold hover:underline">sam@thehumorindex.com</a>
      </p>
    </main>
  );
}

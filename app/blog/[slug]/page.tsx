import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { coverFor } from '@/lib/blogCover';
import AdSlot from '@/components/ads/AdSlot';
import RankedRail from '@/components/ads/RankedRail';
import SocialShare from '@/components/ui/SocialShare';
import EndOfArticleCTA from '@/components/ui/EndOfArticleCTA';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { getAllShows } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { formatIndex } from '@/lib/scoring';
import { POSTS } from '../posts';
import { SITE_URL } from '@/lib/site';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [`/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${params.slug}/`,
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  // Top 3 scored shows for the in-post "explore the rankings" CTA block.
  const allShows = await getAllShows();
  const topShows = allShows
    .filter(s => s.humor_index > 0)
    .sort((a, b) => b.humor_index - a.humor_index)
    .slice(0, 3);

  // "Where they stand today": ranks move every time a show is rescored, so every
  // post that names a ranked show gets that show's live rank next to the byline.
  const board = rankable(allShows).filter(s => s.humor_index > 0).sort((a, b) => b.humor_index - a.humor_index);
  const named = `${post.title} ${post.description}`.toLowerCase();
  const standing = board
    .map((s, i) => ({ s, rank: i + 1 }))
    .filter(({ s }) => {
      const n = s.name.toLowerCase().replace(/^the /, '');
      const short = n.replace(/ in philadelphia$/, '').replace(/ and recreation$/, '');
      return named.includes(n) || (short.length > 4 && named.includes(short));
    })
    .slice(0, 4);

  // Simple markdown-like rendering
  const paragraphs = post.content.trim().split('\n\n');
  const cover = coverFor(params.slug, post.title, allShows);
  // In-article ad goes after the third body paragraph (not a heading, table, list or note).
  let proseCount = 0;
  let adAfter = -1;
  paragraphs.forEach((p, i) => {
    const t = p.trim();
    if (adAfter < 0 && t && !t.startsWith('#') && !t.startsWith('|') && !t.startsWith('- ') && !t.startsWith('>') && !t.startsWith('![') && ++proseCount === 3) adAfter = i;
  });

  const renderBlock = (p: string, i: number) => {
    const trimmed = p.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="font-serif italic text-2xl sm:text-[1.7rem] text-brand-text-primary mt-10 mb-3 leading-tight">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    // Standalone image: a paragraph that is just ![alt](src)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <figure key={i} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgMatch[2]}
            alt={imgMatch[1]}
            className="w-full rounded-xl border border-brand-border"
            loading="lazy"
          />
        </figure>
      );
    }

    // Inline formatting: bold, italic, links
    const formatInline = (text: string) => {
      return text.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-brand-text-primary font-medium">{part.slice(2, -2)}</strong>;
        }
        return part.split(/(\*[^*]+\*)/).map((sub, k) => {
          if (sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')) {
            return <em key={k} className="text-brand-text-muted">{sub.slice(1, -1)}</em>;
          }
          return sub.split(/(\[[^\]]+\]\([^)]+\))/).map((linkPart, l) => {
            const linkMatch = linkPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
              return <Link key={l} href={linkMatch[2]} className="text-brand-gold hover:underline">{linkMatch[1]}</Link>;
            }
            return linkPart;
          });
        });
      });
    };

    // Markdown tables: header row | --- | separator | data rows
    const tableLines = trimmed.split('\n');
    if (
      tableLines.length >= 2 &&
      tableLines[0].trim().startsWith('|') &&
      tableLines[1].includes('-') &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(tableLines[1])
    ) {
      const parseRow = (line: string) =>
        line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(2).filter(l => l.trim()).map(parseRow);
      return (
        <div key={i} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-brand-border">
                {headers.map((h, j) => (
                  <th key={j} className="text-left font-medium text-brand-text-primary py-2 px-3 whitespace-nowrap">{formatInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className="border-b border-brand-border/40">
                  {row.map((cell, c) => (
                    <td key={c} className="py-2 px-3 text-brand-text-secondary align-top">{formatInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter(l => l.startsWith('- '));
      return (
        <ul key={i} className="space-y-1 ml-4">
          {items.map((item, j) => (
            <li key={j} className="text-base text-brand-text-secondary leading-relaxed list-disc">
              {formatInline(item.replace(/^- /, ''))}
            </li>
          ))}
        </ul>
      );
    }

    // Blockquote — used for Editor's Note / Correction callouts
    if (trimmed.startsWith('> ')) {
      const lines = trimmed.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n').trim();
      return (
        <aside
          key={i}
          className="my-6 border-l-4 border-brand-gold bg-brand-gold/5 px-4 py-3 rounded-r-md"
        >
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            {formatInline(lines)}
          </p>
        </aside>
      );
    }

    return (
      <p key={i} className="text-base text-brand-text-secondary leading-[1.75]">
        {formatInline(trimmed)}
      </p>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
    <div className="max-w-3xl min-w-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { '@type': 'Person', name: 'Sam Slater' },
          publisher: {
            '@type': 'Organization',
            name: 'The Humor Index',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon-400.png` },
          },
          url: `${SITE_URL}/blog/${params.slug}`,
          image: `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`,
        }) }}
      />
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${params.slug}` },
        ]}
      />
      <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
        <Link href="/blog" className="hover:text-brand-text-secondary transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-brand-text-secondary">{post.category}</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
            {post.category}
          </span>
          <span className="text-xs text-brand-text-muted">
            By <a href="/about" className="text-brand-text-secondary hover:text-brand-gold">Sam Slater</a> · {formatDate(post.date)}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-brand-text-primary leading-tight mb-4">
          {post.title}
        </h1>
        <SocialShare
          title={post.title}
          text={post.description}
          url={`/blog/${params.slug}`}
        />
        {standing.length > 0 && (
          <p className="mt-4 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-xs text-brand-text-muted">
            <span className="uppercase tracking-wider">Where they stand today:</span>{' '}
            {standing.map(({ s, rank }, i) => (
              <span key={s.slug}>
                {i > 0 && ' · '}
                <Link href={`/shows/${s.slug}/`} className="text-brand-text-secondary hover:text-brand-gold">{s.name}</Link>{' '}
                <span className="font-mono text-brand-gold">#{rank}</span> of {board.length}, {formatIndex(s.humor_index)}
              </span>
            ))}
          </p>
        )}
      </div>

      {cover && (
        <figure className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-brand-border mb-8">
          <Image src={`https://image.tmdb.org/t/p/w1280${cover.backdrop}`} alt={cover.name} fill priority sizes="(min-width: 1024px) 768px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
          <figcaption className="absolute bottom-3 right-4 text-[11px] uppercase tracking-widest text-white/70">{cover.name}</figcaption>
        </figure>
      )}

      <article className="prose-custom space-y-5">
        {paragraphs.map((p, i) => {
          const block = renderBlock(p, i);
          return i === adAfter ? <div key={i}>{block}<AdSlot placement="in-article" className="my-8" /></div> : block;
        })}
      </article>

      <EndOfArticleCTA />

      {/* Explore the rankings — 3 show page links for internal traffic flow */}
      {topShows.length > 0 && (
        <section className="mt-10 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Explore the rankings</p>
          <p className="text-sm text-brand-text-secondary mb-5">
            See the full per-episode breakdown of the highest-ranked sitcoms on the Humor Index.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topShows.map((s, i) => (
              <Link
                key={s.slug}
                href={`/shows/${s.slug}`}
                className="block p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/40 transition-colors group"
              >
                <p className="text-xs text-brand-text-muted font-mono mb-1">#{i + 1}</p>
                <p className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors">
                  {s.name}
                </p>
                <p className="text-xs text-brand-text-muted mt-1">
                  Humor Index <span className="text-brand-gold font-mono">{formatIndex(s.humor_index)}</span>
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/rankings"
            className="inline-block mt-4 text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
          >
            See every show ranked →
          </Link>
        </section>
      )}

      {/* Related posts */}
      {(() => {
        const currentPost = POSTS[params.slug];
        if (!currentPost) return null;
        const related = Object.entries(POSTS)
          .filter(([slug]) => slug !== params.slug)
          .filter(([, p]) => p.category === currentPost.category)
          .slice(0, 2);
        // Fill with other posts if not enough in same category
        if (related.length < 2) {
          const others = Object.entries(POSTS)
            .filter(([slug]) => slug !== params.slug && !related.some(([s]) => s === slug))
            .slice(0, 2 - related.length);
          related.push(...others);
        }
        if (related.length === 0) return null;
        return (
          <div className="mt-10 border-t border-brand-border pt-8">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">You might also like</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(([slug, p]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/40 transition-colors group"
                >
                  <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
                    {p.category}
                  </span>
                  <h3 className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mt-3 mb-1 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-brand-text-muted">{formatDate(p.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="mt-8 border-t border-brand-border pt-8">
        <Link href="/blog" className="text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
          ← Back to all posts
        </Link>
      </div>
    </div>
    <RankedRail />
    </div>
  );
}

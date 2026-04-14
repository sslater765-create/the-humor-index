import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllShows } from '@/lib/data';
import { formatIndex, scoreToColor } from '@/lib/scoring';
// DNA data loaded dynamically from comedy-dna.json
import SocialShare from '@/components/ui/SocialShare';
import { RadarCompareChart, JokeTypesCompareChart } from '@/components/charts';

export const dynamic = 'force-static';
export const dynamicParams = true;

// Auto-generate every possible A-vs-B matchup from available shows
import { SHOW_SLUGS } from '@/lib/constants';

function generateAllMatchups() {
  const matchups: { slugA: string; slugB: string }[] = [];
  for (const a of SHOW_SLUGS) {
    for (const b of SHOW_SLUGS) {
      if (a !== b) {
        matchups.push({ slugA: a, slugB: b });
      }
    }
  }
  return matchups;
}

const MATCHUPS = generateAllMatchups();

function getMatchup(matchupSlug: string) {
  const parts = matchupSlug.split('-vs-');
  const slugA = parts[0];
  const slugB = parts[parts.length - 1];
  if (!slugA || !slugB) return null;
  return { slugA, slugB };
}

export async function generateStaticParams() {
  return MATCHUPS.map(m => ({
    matchup: `${m.slugA}-vs-${m.slugB}`,
  }));
}

export async function generateMetadata({ params }: { params: { matchup: string } }) {
  const match = getMatchup(params.matchup);
  if (!match) return {};
  const shows = await getAllShows();
  const a = shows.find(s => s.slug === match.slugA);
  const b = shows.find(s => s.slug === match.slugB);
  if (!a || !b) return {};

  const winner = a.humor_index >= b.humor_index ? a : b;

  return {
    title: `${a.name} vs ${b.name} — Which Is Funnier? Data Analysis`,
    description: `We analyzed every joke in ${a.name} and ${b.name} to settle the debate. ${winner.name} scores ${formatIndex(winner.humor_index)} vs ${formatIndex(winner === a ? b.humor_index : a.humor_index)}. See the full breakdown.`,
    openGraph: {
      title: `${a.name} vs ${b.name} — The Data Settles It`,
      description: `${winner.name} wins with a Humor Index of ${formatIndex(winner.humor_index)}. See why.`,
      images: [`/api/og?title=${encodeURIComponent(`${a.name} vs ${b.name}`)}&score=${formatIndex(winner.humor_index)}&subtitle=${encodeURIComponent(`${winner.name} wins · Head-to-head comparison`)}`],
    },
    alternates: {
      canonical: `https://thehumorindex.com/compare/${params.matchup}`,
    },
  };
}

function formatVal(val: number): string {
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(1);
}

function MetricRow({ label, valA, valB }: { label: string; valA: number; valB: number }) {
  const aWins = valA > valB;
  const bWins = valB > valA;
  return (
    <div className="flex items-center justify-between py-3 border-b border-brand-border/30">
      <span className={`font-mono text-sm ${aWins ? 'text-brand-gold font-medium' : 'text-brand-text-secondary'}`}>
        {formatVal(valA)}
      </span>
      <span className="text-xs uppercase tracking-widest text-brand-text-muted">{label}</span>
      <span className={`font-mono text-sm ${bWins ? 'text-brand-blue font-medium' : 'text-brand-text-secondary'}`}>
        {formatVal(valB)}
      </span>
    </div>
  );
}

export default async function MatchupPage({ params }: { params: { matchup: string } }) {
  const match = getMatchup(params.matchup);
  if (!match) notFound();

  const shows = await getAllShows();
  const showA = shows.find(s => s.slug === match.slugA);
  const showB = shows.find(s => s.slug === match.slugB);
  if (!showA || !showB) notFound();

  const winner = showA.humor_index >= showB.humor_index ? showA : showB;
  const loser = winner === showA ? showB : showA;
  const margin = Math.abs(showA.humor_index - showB.humor_index);
  const close = margin < 5;

  const { getComedyDna } = await import('@/lib/data');
  const dnaA = await getComedyDna(match.slugA);
  const dnaB = await getComedyDna(match.slugB);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${showA.name} vs ${showB.name}: Which Is Funnier?`,
    description: `Data-driven comparison of ${showA.name} and ${showB.name} comedy scores.`,
    url: `https://thehumorindex.com/compare/${params.matchup}`,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
          <Link href="/compare" className="hover:text-brand-text-secondary transition-colors">Compare</Link>
          <span>/</span>
          <span className="text-brand-text-secondary">{showA.name} vs {showB.name}</span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Head to Head</p>
          <h1 className="text-2xl sm:text-4xl font-medium text-brand-text-primary mb-3">
            <span className="text-brand-gold">{showA.name}</span>
            {' '}vs{' '}
            <span className="text-brand-blue">{showB.name}</span>
          </h1>
          <p className="text-brand-text-secondary max-w-lg mx-auto">
            {close
              ? `A razor-thin margin separates these two comedy giants. ${winner.name} edges out ${loser.name} by just ${margin.toFixed(1)} points.`
              : `${winner.name} takes this one convincingly, outscoring ${loser.name} by ${margin.toFixed(1)} points on the Humor Index.`
            }
          </p>
          <div className="mt-4">
            <SocialShare
              title={`${showA.name} vs ${showB.name} — which is funnier?`}
              text={`Data says ${winner.name} is funnier than ${loser.name} (${formatIndex(winner.humor_index)} vs ${formatIndex(loser.humor_index)}). Do you agree?`}
              url={`/compare/${params.matchup}`}
            />
          </div>
        </div>

        {/* Big score comparison */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">{showA.name}</p>
            <p className="font-mono text-5xl font-bold" style={{ color: scoreToColor(showA.humor_index) }}>
              {formatIndex(showA.humor_index)}
            </p>
            <p className="text-xs text-brand-text-muted mt-1">Humor Index</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-brand-blue mb-2">{showB.name}</p>
            <p className="font-mono text-5xl font-bold" style={{ color: scoreToColor(showB.humor_index) }}>
              {formatIndex(showB.humor_index)}
            </p>
            <p className="text-xs text-brand-text-muted mt-1">Humor Index</p>
          </div>
        </div>

        {/* Metric-by-metric */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-brand-gold">{showA.name}</span>
            <span className="text-xs uppercase tracking-widest text-brand-text-muted">Metric</span>
            <span className="text-xs uppercase tracking-widest text-brand-blue">{showB.name}</span>
          </div>
          <MetricRow label="Humor Index" valA={showA.humor_index} valB={showB.humor_index} />
          <MetricRow label="JPM" valA={showA.avg_jpm} valB={showB.avg_jpm} />
          <MetricRow label="Craft" valA={showA.avg_craft} valB={showB.avg_craft} />
          <MetricRow label="Impact" valA={showA.avg_impact} valB={showB.avg_impact} />
          <MetricRow label="Total Jokes" valA={showA.total_jokes_analyzed} valB={showB.total_jokes_analyzed} />
          {showA.avg_imdb_rating && showB.avg_imdb_rating && (
            <MetricRow label="IMDb Avg" valA={showA.avg_imdb_rating} valB={showB.avg_imdb_rating} />
          )}
          {showA.war && showB.war && (
            <MetricRow label="Total WAR" valA={showA.war} valB={showB.war} />
          )}
          {showA.war_per_episode && showB.war_per_episode && (
            <MetricRow label="WAR / Episode" valA={showA.war_per_episode} valB={showB.war_per_episode} />
          )}
        </div>

        {/* Radar chart */}
        <div className="mb-8">
          <RadarCompareChart showA={showA} showB={showB} />
        </div>

        {/* Joke type comparison */}
        {dnaA && dnaB && (
          <div className="mb-8">
            <JokeTypesCompareChart
              showAName={showA.name}
              showBName={showB.name}
              distA={dnaA}
              distB={dnaB}
            />
          </div>
        )}

        {/* Verdict */}
        <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-8 text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-3">The Verdict</p>
          <p className="text-2xl font-medium text-brand-text-primary mb-2">
            {winner.name} wins.
          </p>
          <p className="text-sm text-brand-text-secondary max-w-md mx-auto">
            {close
              ? `But it's close enough that individual episode matchups could go either way. Both shows are excellent.`
              : `${winner.name} outperforms on ${
                  [
                    showA.avg_craft > showB.avg_craft ? 'craft' : null,
                    showA.avg_impact > showB.avg_impact ? 'impact' : null,
                    showA.avg_jpm > showB.avg_jpm ? 'joke density' : null,
                  ].filter(Boolean).join(', ') || 'multiple dimensions'
                }, making it the funnier show by the numbers.`
            }
          </p>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/shows/${showA.slug}`}
            className="bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold transition-colors group"
          >
            <p className="text-xs text-brand-text-muted mb-1">Explore</p>
            <p className="text-brand-text-primary group-hover:text-brand-gold transition-colors font-medium">{showA.name} →</p>
          </Link>
          <Link
            href={`/shows/${showB.slug}`}
            className="bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-blue transition-colors group"
          >
            <p className="text-xs text-brand-text-muted mb-1">Explore</p>
            <p className="text-brand-text-primary group-hover:text-brand-blue transition-colors font-medium">{showB.name} →</p>
          </Link>
        </div>

        {/* More matchups — show matchups involving either show */}
        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">More Matchups</p>
          <div className="flex flex-wrap gap-2">
            {MATCHUPS
              .filter(m => `${m.slugA}-vs-${m.slugB}` !== params.matchup)
              .filter(m => m.slugA === match.slugA || m.slugA === match.slugB || m.slugB === match.slugA || m.slugB === match.slugB)
              .slice(0, 8)
              .map(m => {
                const nameA = shows.find(s => s.slug === m.slugA)?.name || m.slugA;
                const nameB = shows.find(s => s.slug === m.slugB)?.name || m.slugB;
                return (
                  <Link
                    key={`${m.slugA}-vs-${m.slugB}`}
                    href={`/compare/${m.slugA}-vs-${m.slugB}`}
                    className="text-xs border border-brand-border rounded-full px-3 py-1.5 text-brand-text-muted hover:text-brand-gold hover:border-brand-gold transition-colors"
                  >
                    {nameA} vs {nameB}
                  </Link>
                );
              })}
            <Link
              href="/compare"
              className="text-xs border border-brand-border rounded-full px-3 py-1.5 text-brand-text-muted hover:text-brand-gold hover:border-brand-gold transition-colors"
            >
              Custom comparison →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

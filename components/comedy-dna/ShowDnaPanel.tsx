'use client';
// Show-page Comedy DNA block. Without a profile it is a one-tap face-off
// pinned to this show ("how well does X match you?"). With one, it shows the
// visitor's match %, where the show ranks for them, why, and this show's jokes
// that fit their picks.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { jokesForProfile, readLevel, whyText, titleHref, type QuizJoke } from '@/lib/comedyDna';
import { trackEvent } from '@/lib/analytics';
import { useDna } from './DnaProvider';
import QuickPick from './QuickPick';

interface Props {
  slug: string;
  name: string;
  /** This show's battle + recommendation jokes. */
  showJokes: QuizJoke[];
  /** Jokes from other ranked shows, for the face-offs. */
  otherJokes: QuizJoke[];
}

export default function ShowDnaPanel({ slug, name, showJokes, otherJokes }: Props) {
  const dna = useDna();
  const [sharpen, setSharpen] = useState(false);
  const pickPool = useMemo(() => [...showJokes, ...otherJokes], [showJokes, otherJokes]);
  const profile = dna?.hasProfile ? dna.profile : null;
  const baseline = dna?.baseline;
  const forYou = useMemo(
    () => (profile && baseline ? jokesForProfile(profile, showJokes, baseline, 3) : []),
    [profile, baseline, showJokes],
  );

  if (!dna || !dna.ready) return <div className="min-h-[200px]" aria-hidden />;

  if (!dna.hasProfile) {
    return (
      <QuickPick
        jokes={pickPool}
        focus={slug}
        source="show_page"
        title={`Is ${name} your kind of funny?`}
        subtitle={`Pick the funnier joke. A few picks give you a match % for ${name} and every other show we rank.`}
      />
    );
  }

  const m = dna.matchFor(slug);
  if (!m) return null;
  const rank = dna.matches.findIndex(x => x.slug === slug) + 1;
  const level = readLevel(dna.profile.picks);

  return (
    <section className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-7">
      <div className="grid md:grid-cols-[minmax(0,260px)_1fr] gap-6 md:gap-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-2">Your Comedy DNA</p>
          <p className="font-serif italic text-6xl text-brand-teal leading-none tabular-nums">{m.pct}%</p>
          <p className="text-sm text-brand-text-primary mt-2">match with {name}</p>
          <p className="text-xs text-brand-text-muted mt-1">
            #{rank} of {dna.matches.length} for your taste · {level.label}, {dna.profile.picks} picks
          </p>
          <p className="text-sm text-brand-text-secondary mt-4 leading-relaxed">{whyText(m, dna.profile.pref, dna.weights, dna.meanFp)}</p>
          {rank > 1 && (
            <p className="text-xs text-brand-text-muted mt-3">
              Your top match is{' '}
              <Link href={titleHref(dna.matches[0])} className="text-brand-teal hover:underline">{dna.matches[0].name}</Link>
              {' '}({dna.matches[0].pct}%).
            </p>
          )}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-text-muted mb-3">From {name}, picked for your taste</p>
          <div className="flex flex-col gap-2.5">
            {forYou.map(j => (
              <div key={j.id} className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3">
                <p className="text-[15px] text-brand-text-primary leading-snug">
                  <span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span>
                </p>
                <p className="text-xs text-brand-text-muted mt-1.5">
                  {j.speaker}{j.speaker && j.ep ? ' · ' : ''}{j.ep}{j.etitle ? ` · ${j.etitle}` : ''}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5 mt-4">
            <button onClick={() => { setSharpen(s => !s); trackEvent('cdna_show_sharpen', { slug }); }}
              className="rounded-full border border-brand-border hover:border-brand-gold text-sm font-semibold px-4 py-2 transition">
              {sharpen ? 'Done sharpening' : 'Sharpen this match'}
            </button>
            <Link href="/comedy-dna" className="rounded-full text-sm font-semibold px-4 py-2 text-brand-text-secondary hover:text-brand-gold transition">
              Your full Comedy DNA →
            </Link>
          </div>
        </div>
      </div>
      {sharpen && (
        <QuickPick className="mt-6 !bg-brand-surface" jokes={pickPool} focus={slug} source="show_sharpen" title={`${name} vs. the field`} subtitle="Each pick updates the number above." />
      )}
    </section>
  );
}

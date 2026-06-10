import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getComedyDnaQuiz, getComedyDnaFingerprints } from '@/lib/data';
import {
  ARCHES, archetypeBySlug, archetypeExemplars, archetypeExampleJokes,
  emblemSVG, EMBLEMS, DNA_TYPES, normalizeFingerprints,
} from '@/lib/comedyDna';
import { SITE_URL } from '@/lib/site';

// Human-readable labels for the 18 joke types — used in the quantified stats panel.
const TYPE_LABELS: Record<string, string> = {
  character_comedy: 'Character-driven', escalation: 'Escalation', absurdist: 'Absurdism',
  cringe_discomfort: 'Cringe', observational: 'Observational', irony_sarcasm: 'Irony & sarcasm',
  setup_punchline: 'Setup–punchline', deadpan_understatement: 'Deadpan', wordplay_pun: 'Wordplay & puns',
  dark_subversive: 'Dark & subversive', callback: 'Callbacks', misdirection: 'Misdirection',
  reaction_beat: 'Reaction beats', visual_gag: 'Visual gags', physical_slapstick: 'Slapstick',
  meta_self_referential: 'Meta', running_gag: 'Running gags', awkward_silence: 'Awkward silence',
};

export function generateStaticParams() {
  return ARCHES.map(a => ({ archetype: a.slug }));
}

export async function generateMetadata({ params }: { params: { archetype: string } }): Promise<Metadata> {
  const a = archetypeBySlug(params.archetype);
  if (!a) return { title: 'Comedy Archetype' };
  const title = `${a.name} — Comedy Archetype`;
  const desc = `${a.name}: ${a.tag} ${a.blurb} Find out if it's your comedy type.`;
  const og = '/api/og?title=' + encodeURIComponent(a.name) + '&subtitle=' + encodeURIComponent(a.tag);
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/comedy-dna/${a.slug}/` },
    openGraph: { title, description: a.tag, url: `${SITE_URL}/comedy-dna/${a.slug}/`, type: 'article', images: [{ url: og, width: 1200, height: 630, alt: a.name }] },
    twitter: { card: 'summary_large_image', title, description: a.tag, images: [og] },
  };
}

export default async function ArchetypePage({ params }: { params: { archetype: string } }) {
  const arche = archetypeBySlug(params.archetype);
  if (!arche) notFound();

  const [quiz, fingerprints] = await Promise.all([getComedyDnaQuiz(), getComedyDnaFingerprints()]);
  const exemplar = archetypeExemplars(fingerprints).find(e => e.arche.slug === arche.slug);
  const jokes = archetypeExampleJokes(arche, quiz.pool, 3);

  // Quantified stats: how much this type leans into its top joke types vs. the wider pool baseline.
  // Compares share-of-joke-moments (L1-normalized) so the units match the show fingerprint.
  const normFps = normalizeFingerprints(fingerprints);
  const exemplarFp = exemplar ? normFps.find(f => f.slug === exemplar.slug)?.fp ?? null : null;
  const poolApp = DNA_TYPES.map((_, i) => quiz.pool.reduce((s, j) => s + (j.vec[i] || 0), 0));
  const poolTotal = poolApp.reduce((a, b) => a + b, 0);
  const poolShare = poolApp.map(n => (poolTotal ? n / poolTotal : 0));
  const top3 = (Object.entries(arche.weights) as [string, number | undefined][])
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3)
    .map(([type]) => {
      const i = DNA_TYPES.indexOf(type as (typeof DNA_TYPES)[number]);
      if (i < 0) return null;
      const ex = exemplarFp ? exemplarFp[i] : 0;
      const base = poolShare[i];
      const lift = base > 0 ? ex / base : 0;
      return { type, label: TYPE_LABELS[type] || type, exShare: ex, baseShare: base, lift };
    })
    .filter((x): x is { type: string; label: string; exShare: number; baseShare: number; lift: number } => !!x);

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `What is the ${arche.name.replace(/^The /, '')} comedy type?`,
        acceptedAnswer: { '@type': 'Answer', text: `${arche.name} — ${arche.tag} ${arche.blurb}` } },
      ...(exemplar?.name ? [{ '@type': 'Question', name: `Which sitcom is the most ${arche.name.replace(/^The /, '').toLowerCase()}?`,
        acceptedAnswer: { '@type': 'Answer', text: `Among the sitcoms scored by The Humor Index, ${exemplar.name} best embodies ${arche.name} — its joke mix matches this archetype most closely.` } }] : []),
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14 text-brand-text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <nav className="text-sm text-brand-text-muted mb-6">
        <Link href="/comedy-dna" className="hover:text-brand-gold">Comedy DNA</Link> / {arche.name}
      </nav>

      <div className="flex items-center gap-4 mb-4">
        <span className="shrink-0 inline-flex items-center justify-center rounded-full border-[2.5px] bg-brand-surface"
          style={{ borderColor: EMBLEMS[arche.emblem].c, width: 72, height: 72 }} aria-hidden
          dangerouslySetInnerHTML={{ __html: emblemSVG(arche.emblem, 44) }} />
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Comedy archetype</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{arche.name}</h1>
          <p className="text-brand-gold font-semibold">{arche.tag}</p>
        </div>
      </div>

      <p className="text-lg text-brand-text-secondary max-w-2xl mb-6">{arche.blurb}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {arche.tags.map(t => <span key={t} className="text-xs font-semibold text-brand-text-secondary bg-brand-surface border border-brand-border px-2.5 py-1 rounded-full">{t}</span>)}
      </div>

      {exemplar?.name && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Most exemplified by</p>
          <p className="text-brand-text-secondary">The sitcom whose joke mix matches {arche.name} most closely is{' '}
            <Link href={`/shows/${exemplar.slug}/`} className="text-brand-gold hover:underline font-semibold">{exemplar.name}</Link>.</p>
        </div>
      )}

      {top3.length > 0 && exemplar?.name && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-3">By the numbers</p>
          <p className="text-sm text-brand-text-secondary mb-4">How concentrated this archetype&apos;s signature joke types are in <b className="text-brand-text-primary">{exemplar.name}</b>, vs the baseline share across every joke we&apos;ve scored.</p>
          <div className="space-y-3.5">
            {top3.map(s => (
              <div key={s.type}>
                <div className="flex justify-between items-baseline mb-1.5 text-sm">
                  <span className="font-bold">{s.label}</span>
                  <span className="text-brand-text-secondary tabular-nums">
                    <b className="text-brand-gold">{(s.exShare * 100).toFixed(0)}%</b>
                    <span className="mx-1.5 text-brand-text-muted">·</span>
                    {s.lift >= 1.05 ? `${s.lift.toFixed(1)}× the baseline` : s.lift <= 0.95 && s.lift > 0 ? `${(1 / s.lift).toFixed(1)}× below baseline` : 'about average'}
                  </span>
                </div>
                <div className="relative h-2 bg-brand-border rounded-full overflow-hidden" aria-hidden>
                  <div className="absolute inset-y-0 left-0 bg-brand-text-muted/40" style={{ width: `${Math.min(100, s.baseShare * 350)}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-brand-gold" style={{ width: `${Math.min(100, s.exShare * 350)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-brand-text-muted mt-3.5"><span className="inline-block w-2 h-2 rounded-full bg-brand-gold mr-1.5 align-middle" />Share in {exemplar.name}  <span className="inline-block w-2 h-2 rounded-full bg-brand-text-muted/40 mx-1.5 ml-3 align-middle" />Baseline across all jokes</p>
        </div>
      )}

      {jokes.length > 0 && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-3">Jokes a {arche.name.replace(/^The /, '')} loves</p>
          <div className="space-y-3">
            {jokes.map(j => (
              <div key={j.id} className="bg-brand-surface border border-brand-border rounded-xl p-4">
                <p className="text-base"><span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span></p>
                <p className="text-xs uppercase tracking-wider text-brand-text-muted mt-2">— {j.speaker ? `${j.speaker}, ${j.show}` : j.show}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 mb-10 text-center">
        <h2 className="text-xl font-bold mb-1">Is the {arche.name.replace(/^The /, '')} your type?</h2>
        <p className="text-brand-text-secondary mb-4">Take the 2-minute Comedy DNA quiz — pick which joke is funnier and find out.</p>
        <Link href="/comedy-dna" className="inline-flex rounded-full bg-brand-gold text-brand-dark font-bold px-6 py-3">Find your Comedy DNA →</Link>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">The other archetypes</p>
        <div className="flex flex-wrap gap-2">
          {ARCHES.filter(a => a.slug !== arche.slug).map(a => (
            <Link key={a.slug} href={`/comedy-dna/${a.slug}`} className="text-sm font-semibold text-brand-text-secondary border border-brand-border rounded-full px-3.5 py-2 hover:border-brand-gold hover:text-brand-text-primary transition">{a.name}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}

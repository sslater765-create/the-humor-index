import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';

export const metadata = {
  title: 'About — The Humor Index',
  description: 'The Humor Index was built by Sam to answer one question: which sitcom is actually the funniest? Here\'s the story.',
  alternates: {
    canonical: 'https://thehumorindex.com/about',
  },
  openGraph: {
    title: 'About — The Humor Index',
    description: 'The Humor Index was built by Sam to answer one question: which sitcom is actually the funniest? Here\'s the story.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

export default async function AboutPage() {
  const shows = await getAllShows();
  const analyzedShows = shows.filter(s => s.humor_index > 0);
  let totalEpisodes = 0;
  for (const show of analyzedShows) {
    try {
      const eps = await getEpisodes(show.slug);
      totalEpisodes += eps.length;
    } catch {}
  }
  const totalJokes = shows.reduce((s, show) => s + show.total_jokes_analyzed, 0);

  return (
    <div>
      <PageHeader
        label="About"
        title="The Story"
        subtitle="One late night, one dumb question, one very large spreadsheet."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: totalJokes.toLocaleString(), label: 'Jokes Scored' },
            { value: String(shows.length), label: 'Shows Tracked' },
            { value: String(totalEpisodes), label: 'Episodes Analyzed' },
            { value: '18', label: 'Joke Categories' },
          ].map(stat => (
            <div key={stat.label} className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
              <p className="font-mono text-2xl text-brand-gold font-bold">{stat.value}</p>
              <p className="text-xs text-brand-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Origin */}
        <section>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Why this exists</h2>
          <div className="space-y-4 text-sm text-brand-text-secondary leading-relaxed">
            <p>
              The Humor Index started the way most projects do: lying in bed, unable to sleep,
              with an idea that wouldn&apos;t shut up.
            </p>
            <p>
              The question was simple &mdash; <em>which sitcom is actually the funniest?</em> Not
              according to critics, not by ratings, not by how loud the laugh track is. By the
              jokes themselves. Every single one, scored on craft, impact, and density.
            </p>
            <p>
              I&apos;d had this idea rattling around for years. Then one night it clicked that AI
              had finally gotten good enough to do it. So I built a pipeline that reads every
              transcript, detects every joke, and scores each one across multiple dimensions. No
              opinions, no fan votes &mdash; just structured analysis of what makes comedy work.
            </p>
            <p>
              This is my first project like this. It turns out quantifying humor is
              harder than it sounds &mdash; but the data is genuinely fascinating.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">How it works</h2>
          <div className="space-y-4 text-sm text-brand-text-secondary leading-relaxed">
            <p>
              Every episode gets fed through a two-phase AI analysis pipeline. Phase one detects
              every comedic moment in the transcript &mdash; dialogue jokes, physical comedy cues,
              reaction beats, cringe sequences, callbacks, the works. Phase two scores each joke
              on craft (originality, structure, character fit, economy, earned-vs-cheap) and impact
              (audience reaction, quotability, rewatch value).
            </p>
            <p>
              Those joke-level scores get aggregated into episode scores, season scores, and
              show-level rankings. The full math is on the{' '}
              <Link href="/methodology" className="text-brand-gold hover:underline">
                Methodology page
              </Link>.
            </p>
          </div>

          {/* Pipeline visual */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 text-center">
            {[
              { step: '1', title: 'Transcript', desc: 'Episode text' },
              { step: '2', title: 'Detection', desc: 'Find every joke' },
              { step: '3', title: 'Scoring', desc: 'Craft + Impact' },
              { step: '4', title: 'Index', desc: 'Humor Index score' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex-1 min-w-[120px]">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mx-auto mb-2">
                    <span className="font-mono text-sm text-brand-gold">{s.step}</span>
                  </div>
                  <p className="text-sm text-brand-text-primary font-medium">{s.title}</p>
                  <p className="text-xs text-brand-text-muted">{s.desc}</p>
                </div>
                {i < 3 && <span className="text-brand-text-muted hidden sm:block">&rarr;</span>}
              </div>
            ))}
          </div>
        </section>

        {/* About Sam */}
        <section>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">About the builder</h2>
          <div className="space-y-4 text-sm text-brand-text-secondary leading-relaxed">
            <p>
              I&apos;m Sam. By day, I work in education and business leadership &mdash;
              from student advisor at Kaplan Test Prep all the way
              to VP of Growth at Triad. I&apos;ve spent my career building teams, scaling
              organizations, and figuring out how to make complex things accessible.
            </p>
            <p>
              The Humor Index is a different kind of project for me. It&apos;s not my industry,
              it&apos;s not my day job &mdash; it&apos;s the thing I built because I couldn&apos;t
              stop thinking about it. Turns out the skills transfer: breaking down subjective
              things into measurable components is what I&apos;ve been doing my whole career, just
              usually with test scores instead of joke scores.
            </p>
            <p>
              I live in Orlando, Florida with my wife Franchesca and our three kids &mdash;
              who are, for the record, not yet old enough to appreciate Seinfeld.
            </p>
          </div>
        </section>

        {/* What's next */}
        <section>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">What&apos;s coming</h2>
          <div className="space-y-4 text-sm text-brand-text-secondary leading-relaxed">
            <p>
              We&apos;ve fully analyzed The Office and Seinfeld, with Friends currently in progress.
              The goal is complete coverage of 11 major sitcoms &mdash; every episode of
              Arrested Development, Parks and Rec, 30 Rock, Brooklyn Nine-Nine, It&apos;s Always
              Sunny, Schitt&apos;s Creek, The Big Bang Theory, and Two and a Half Men.
            </p>
            <p>
              After that? More shows based on{' '}
              <Link href="/request" className="text-brand-gold hover:underline">
                your votes
              </Link>
              . Character-level deep dives. Cross-show joke type analysis. And whatever else the
              data reveals.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-brand-border pt-8">
          <p className="text-sm text-brand-text-secondary mb-4">
            Questions, feedback, or just want to argue about whether Seinfeld is funnier
            than The Office? Find us on social:
          </p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              @thehumorindex
            </a>
            <a href="https://instagram.com/thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              @thehumorindex
            </a>
            <a href="https://tiktok.com/@thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              @thehumorindex
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

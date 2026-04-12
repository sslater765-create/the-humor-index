import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';

export const metadata = {
  title: 'About — The Humor Index',
  description: 'The Humor Index was built by Sam to answer one question: which sitcom is actually the funniest? Here\'s the story.',
};

export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        label="About"
        title="The Story"
        subtitle="One late night, one dumb question, one very large spreadsheet."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">

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

        {/* How it works (brief) */}
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
            <p>
              <a
                href="https://www.linkedin.com/in/samuelslater/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                LinkedIn
              </a>
            </p>
          </div>
        </section>

        {/* What's next */}
        <section>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">What&apos;s coming</h2>
          <div className="space-y-4 text-sm text-brand-text-secondary leading-relaxed">
            <p>
              Right now we&apos;ve fully analyzed The Office and are working through Seinfeld.
              The goal is complete coverage of 11 major sitcoms &mdash; every episode of Friends,
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
          <p className="text-sm text-brand-text-muted">
            Questions, feedback, or just want to argue about whether Seinfeld is funnier
            than The Office?{' '}
            <a
              href="https://www.linkedin.com/in/samuelslater/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Reach out on LinkedIn
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}

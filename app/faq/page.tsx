import PageHeader from '@/components/layout/PageHeader';
import { SITE_URL } from '@/lib/site';
import { leaderboardSentence } from '@/lib/siteStats';

export const metadata = {
  title: 'Frequently Asked Questions About Comedy Scoring',
  description: 'Frequently asked questions about The Humor Index: how it works, what AI we use, and why your favorite show scored the way it did.',
  alternates: {
    canonical: `${SITE_URL}/faq/`,
  },
  openGraph: {
    title: 'FAQ — The Humor Index',
    description: 'Frequently asked questions about The Humor Index: how it works, what AI we use, and why your favorite show scored the way it did.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

const faqs = [
  {
    q: 'Is this scored by AI?',
    a: `Yes. Every episode is analyzed by AI using a structured two-phase process: first detecting every joke in the transcript, then scoring each one across multiple dimensions. The AI reads the full transcript and identifies comedic moments — dialogue jokes, physical comedy cues, reaction beats, cringe sequences, and more.`,
  },
  {
    q: 'Which AI model scores the jokes?',
    a: `Anthropic's Claude Sonnet 4.6. Each episode (or 22-minute movie reel) is scored three times and the results are averaged. Shows scored on an earlier model are kept off the ranking until they are rescored, because scores from different models aren't comparable.`,
  },
  {
    q: 'Can AI actually understand comedy?',
    a: `It's a fair question. AI doesn't laugh, but it can identify joke structure: setups, punchlines, callbacks and misdirection. What we have measured so far is how consistent the model is with itself. A single scoring run is noisy (an ICC of 0.28 on a 30-episode retest), which is why every episode is now scored three times and averaged. We have not yet published a comparison against human raters; the Agree? page is where we are collecting that data, and we will publish the agreement rate. Where AI struggles most is purely visual gags and delivery, which a transcript can't carry.`,
  },
  {
    q: 'Which show currently ranks #1?',
    // Answer is generated from live data at build time (see FAQPage) so it can
    // never go stale; this is just a fallback.
    a: 'See the live leaderboard on the rankings page.',
  },
  {
    q: 'Do you penalize multi-camera shows or laugh tracks?',
    a: `No longer. Earlier versions of the Humor Index applied a format coefficient (a 15–25% reduction on Impact for multi-cam and laugh-track shows). We removed it on 2026-04-16 after concluding it was a thumb on the scale rather than a data-driven adjustment. All shows now use a coefficient of 1.0. Read the full reasoning on our Methodology page and in the "Seinfeld vs. The Office" blog post.`,
  },
  {
    q: 'What does "Craft" measure?',
    a: `Craft is the writing quality of each joke, scored across five sub-dimensions: Originality (how fresh the joke is), Structure (setup-punchline clarity, misdirection), Character Integration (does it fit who's saying it?), Economy (no wasted words), and Earned vs. Cheap (was it set up through story context, or is it a lazy gag?). Craft is weighted 40% of the final Humor Index.`,
  },
  {
    q: 'What does "JPM" mean?',
    a: `Jokes Per Minute — the total number of detected jokes divided by the episode's runtime. It measures comedic density. A high JPM means the show is consistently firing; a low JPM might mean longer dramatic stretches between laughs. JPM alone doesn't determine quality — a show can have low JPM but extremely high Craft (prestige comedy).`,
  },
  {
    q: 'What does "Impact" measure?',
    a: `Impact estimates the audience reaction to each joke — how hard it lands. It factors in quotability (will people repeat this line?), rewatch bonus (is it funnier the second time?), and cultural footprint. Impact is no longer adjusted by show format (see the laugh-track question above).`,
  },
  {
    q: 'Why do some shows show 0.0 scores?',
    a: `Shows listed with no score are queued and not scored yet. We don't estimate or fill in scores; a show appears on the leaderboard only once every episode has been scored on the current model.`,
  },
  {
    q: 'How many jokes do you find per episode?',
    a: `Typically 30-70 per 22-minute episode, depending on the show's style. Dense comedies like Arrested Development and 30 Rock tend toward the higher end. Shows with more dramatic content or longer scenes between jokes come in lower. Every joke is individually scored.`,
  },
  {
    q: 'What is the 0-100 score scale?',
    a: `Raw scores are on a 0–10 scale internally. We convert them to a 0–100 display scale where 75 is an average comedy episode. Above 98 the scale bends toward 100 without reaching it, so no two top episodes tie at a perfect score. The scale depends on the scoring model: when we moved to a newer model, scores rose 8 to 15 points, which is why shows scored on the earlier model are listed separately until they are rescored. Treat differences of about a point as ties.`,
  },
  {
    q: 'Do you analyze every episode of every show?',
    a: `Yes, for every show we list: every episode of the full run, not a sample (clip shows are left out because they repeat jokes from other episodes). Partial analysis would undermine the rankings, so a show isn't ranked until it is complete.`,
  },
  {
    q: 'Can I request a show?',
    a: `Yes! Head to the Request page and vote for the show you want analyzed next. Top-voted shows get prioritized.`,
  },
  {
    q: 'Is the data open source?',
    a: `Partly. The methodology is public, and the Data page serves the scored data as JSON files, including every movie joke with its timestamp. The scores and rankings are licensed CC BY-NC 4.0: free to use with credit for non-commercial work; for commercial use, email sam@thehumorindex.com.`,
  },
  {
    q: 'Why transcripts instead of watching the episodes?',
    a: `AI can't watch video reliably yet. Transcripts capture dialogue and some stage directions, which is where most sitcom humor lives, but they miss purely visual gags and the delivery that makes many lines land. We don't adjust scores to compensate; we treat it as a known limitation and flag it on the Methodology page.`,
  },
];

export default async function FAQPage() {
  // Generate the ranking answer from live data so it never goes stale.
  const rankAnswer = await leaderboardSentence();
  const resolvedFaqs = faqs.map(faq =>
    faq.q === 'Which show currently ranks #1?' ? { ...faq, a: rankAnswer } : faq
  );
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: resolvedFaqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        }) }}
      />
      <PageHeader
        label="Questions"
        title="FAQ"
        subtitle="Everything you want to know about how The Humor Index works."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8">
          {resolvedFaqs.map((faq, i) => (
            <div key={i} className="border-b border-brand-border pb-8 last:border-0">
              <h2 className="text-base font-medium text-brand-text-primary mb-3">
                {faq.q}
              </h2>
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

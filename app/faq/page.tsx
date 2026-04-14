import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'FAQ — The Humor Index',
  description: 'Frequently asked questions about The Humor Index: how it works, what AI we use, and why your favorite show scored the way it did.',
  alternates: {
    canonical: 'https://thehumorindex.com/faq',
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
    a: `Yes. Every episode is analyzed by Claude (Anthropic's AI) using a structured two-phase process: first detecting every joke in the transcript, then scoring each one across multiple dimensions. The AI reads the full transcript and identifies comedic moments — dialogue jokes, physical comedy cues, reaction beats, cringe sequences, and more.`,
  },
  {
    q: 'Can AI actually understand comedy?',
    a: `It's a fair question. AI doesn't "laugh" — but it can reliably identify joke structures, setups, punchlines, callbacks, and misdirection. Our validation tests against manually-scored episodes show strong alignment on joke detection and scoring. Where AI struggles most is with purely visual gags or delivery-dependent humor, which is why we work from transcripts and apply format-based adjustments.`,
  },
  {
    q: 'Why does The Office rank #1?',
    a: `We've fully analyzed both The Office and Seinfeld, with Friends currently in progress. The Office leads because our Humor Index rewards consistency — it has fewer weak episodes than Seinfeld. The Office also benefits from the single-camera format, which doesn't receive the laugh track penalty that multi-camera shows like Seinfeld get.`,
  },
  {
    q: 'What is the "laugh track penalty"?',
    a: `Multi-camera sitcoms filmed with a live audience or sweetened laugh track receive an Impact score adjustment. The reasoning: laugh tracks artificially inflate perceived joke impact. A joke that gets a big audience reaction isn't necessarily better-crafted than one that lands in silence on a single-camera show. The coefficients are: Single Camera (1.0x), Hybrid (0.9x), Multi-Camera Live (0.85x), Multi-Camera Sweetened (0.75x).`,
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
    a: `Impact estimates the audience reaction to each joke — how hard it lands. It factors in quotability (will people repeat this line?), rewatch bonus (is it funnier the second time?), and emotional weight. Impact is adjusted by show format to account for laugh track inflation.`,
  },
  {
    q: 'Why do some shows show 0.0 scores?',
    a: `Those shows are queued for analysis but haven't been scored yet. We're working through the catalog — each episode takes a few minutes to analyze. Shows will populate with real scores as analysis completes. We don't fake or estimate scores.`,
  },
  {
    q: 'How many jokes do you find per episode?',
    a: `Typically 30-70 per 22-minute episode, depending on the show's style. Dense comedies like Arrested Development and 30 Rock tend toward the higher end. Shows with more dramatic content or longer scenes between jokes come in lower. Every joke is individually scored.`,
  },
  {
    q: 'What is the 0-100 score scale?',
    a: `Raw scores are on a 0-10 scale internally. We convert to a 0-100 display scale where 75 represents an "average comedy episode." This is a fixed calibration — scores won't shift as we add more shows. A score of 90+ is exceptional, 80-89 is great, 70-79 is solid, and below 70 means the episode had weaker-than-average humor.`,
  },
  {
    q: 'Do you analyze every episode of every show?',
    a: `That's the goal. We're starting with the full runs of 11 major sitcoms — every single episode, not a sample. This means 1,900+ episodes when complete. It takes time, but partial analysis would undermine the rankings.`,
  },
  {
    q: 'Can I request a show?',
    a: `Yes! Head to the Request page and vote for the show you want analyzed next. Top-voted shows get prioritized.`,
  },
  {
    q: 'Is the data open source?',
    a: `The scoring methodology is fully transparent on our Methodology page. The raw joke-level data isn't currently public, but we're considering it for research purposes.`,
  },
  {
    q: 'Why transcripts instead of watching the episodes?',
    a: `AI can't watch video (yet). Transcripts capture dialogue, stage directions, and timing cues — which is where the vast majority of sitcom humor lives. We acknowledge this misses some purely visual gags, which is one reason we adjust scores by format. Single-camera shows like The Office embed more visual comedy cues in their scripts than multi-camera shows.`,
  },
];

export default function FAQPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(faq => ({
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
          {faqs.map((faq, i) => (
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

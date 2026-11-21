# The Humor Index design rules

One page, so new modules stop inventing their own look. Written 2026-11-21 from the site review.

## Type
- **Scores are always mono** (`font-mono`), gold when they are the subject, primary text otherwise. Never italic serif for a number.
- **Display headings** (page and section titles a reader lands on): italic serif, `font-serif italic`, no closing period.
- **Card and list headings**: plain sans, `text-base` to `text-lg`, `font-medium`.
- **Eyebrows** (tracked uppercase labels): one per section at most, `text-[11px] uppercase tracking-[0.25em] text-brand-gold`. Don't put one on every card.
- Smallest text on the site is 11 px.

## Color
- `brand-gold` means "this is the score" or "this is the main action". Nothing else.
- Neutrals for everything else: `text-primary`, `text-secondary` (#A0A0A0), `text-muted` (#8A8A8A, at least 4.6:1 on every background).
- Metric labels are neutral (`MetricBadge`), not colored chips.
- One semantic pair for change: emerald for up, rose for down. Format pills keep their colors; nothing new gets a hue without a meaning.

## Shape
- One card style: `rounded-xl border border-brand-border bg-brand-card`. Don't nest cards in cards; use spacing and a hairline instead.
- Spacing steps: 3, 5, 10 (in Tailwind units) for inside a card, between cards, between sections.

## Charts
- Bars start at zero, or show the difference from a stated average around a zero line. No cropped axes on bar charts.
- No radar charts. Compare metrics with paired bars on their own scales, real values printed.
- The Laugh Map (bars across a runtime, brightest where it's funniest) is the house motif. Use `MiniLaughMap` before inventing a new mini-chart.

## Content order
- Every page that's about a show, episode or film puts a joke on the first screen.
- One newsletter prompt in the body at most, after the main content. The sticky bar and footer form are enough.

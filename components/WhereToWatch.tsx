'use client';
import { trackEvent } from '@/lib/analytics';

/**
 * "Where to watch" affiliate block for show & episode pages.
 *
 * Day one: works with plain JustWatch deep links (no approval needed) so it's
 * useful immediately. Once you're approved for affiliate programs, paste your
 * IDs into AFFILIATE_TAGS below and every button starts earning — no other change.
 *
 * Usage:  <WhereToWatch show="Curb Your Enthusiasm" />
 */

// ⬇️ Paste your affiliate IDs here once approved (Move 3 in the Phase 1 Playbook).
const AFFILIATE_TAGS = {
  amazon: '', // e.g. 'humorindex-20'  → Amazon Associates tracking ID
  appleCampaign: '', // e.g. 'humorindex' → Apple PHG campaign token
};

function justWatchUrl(show: string) {
  return `https://www.justwatch.com/us/search?q=${encodeURIComponent(show)}`;
}
function amazonUrl(show: string) {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(show)}&i=instant-video`;
  return AFFILIATE_TAGS.amazon ? `${base}&tag=${AFFILIATE_TAGS.amazon}` : base;
}
function appleUrl(show: string) {
  const base = `https://tv.apple.com/search?term=${encodeURIComponent(show)}`;
  return AFFILIATE_TAGS.appleCampaign ? `${base}&ct=${AFFILIATE_TAGS.appleCampaign}` : base;
}

type Provider = { label: string; href: string };

export default function WhereToWatch({
  show,
  providers,
}: {
  show: string;
  /** Optional explicit overrides, e.g. [{label:'Max', href:'https://play.max.com/...'}] */
  providers?: Provider[];
}) {
  const links: Provider[] =
    providers ?? [
      { label: 'Find every option', href: justWatchUrl(show) },
      { label: 'Prime Video', href: amazonUrl(show) },
      { label: 'Apple TV', href: appleUrl(show) },
    ];

  return (
    <div className="my-6 rounded-xl border border-brand-border bg-brand-surface p-4 sm:p-5">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-text-secondary">
        Where to watch {show}
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((p) => (
          <a
            key={p.label}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackEvent('where_to_watch_click', { show, provider: p.label })}
            className="rounded-lg border border-brand-border px-3.5 py-2 text-sm text-brand-text-primary transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            {p.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

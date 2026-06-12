'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { charImageSrc } from '@/lib/charImage';

const LEAGUE_MEDIAN = 6.775;
const REPLACEMENT = 6.555;
const BAR_MIN = 6.0;
const BAR_MAX = 7.5;

export interface BottomCharacter {
  name: string;
  fullName: string;
  showName: string;
  showSlug: string;
  showFormat: string;
  totalJokes: number;
  episodesAppeared: number;
  quality: number;
  peakQuality: number | null;
  vsCastmates: number | null;
  vsCastmatesEps: number;
  vsCastmatesCiHalf: number | null;
  actor?: string;
  profilePath?: string;
}

const FORMAT_LABELS: Record<string, string> = {
  all: 'All formats',
  single_camera: 'Single-cam',
  multi_camera_live: 'Multi-cam (live)',
  multi_camera_sweetened: 'Multi-cam (laugh track)',
  hybrid: 'Hybrid',
};

function tierFor(q: number): { color: string; bar: string } {
  if (q < REPLACEMENT) return { color: 'text-rose-400', bar: 'bg-rose-500/70' };
  if (q < LEAGUE_MEDIAN) return { color: 'text-amber-400', bar: 'bg-amber-500/70' };
  return { color: 'text-emerald-400', bar: 'bg-emerald-500/70' };
}

function barPct(q: number): number {
  const pct = ((q - BAR_MIN) / (BAR_MAX - BAR_MIN)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default function LeastFunnyClient({ characters }: { characters: BottomCharacter[] }) {
  const [showSlug, setShowSlug] = useState('all');
  const [format, setFormat] = useState('all');

  const availableShows = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of characters) m.set(c.showSlug, c.showName);
    return Array.from(m.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [characters]);

  const availableFormats = useMemo(
    () => Array.from(new Set(characters.map(c => c.showFormat))),
    [characters]
  );

  const filtered = useMemo(() => {
    let list = characters;
    if (showSlug !== 'all') list = list.filter(c => c.showSlug === showSlug);
    if (format !== 'all') list = list.filter(c => c.showFormat === format);
    return list;
  }, [characters, showSlug, format]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="lf-show" className="text-xs text-brand-text-muted pl-2">Show:</label>
          <select
            id="lf-show"
            value={showSlug}
            onChange={e => setShowSlug(e.target.value)}
            className="text-xs bg-transparent text-brand-text-primary py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            <option value="all">All shows</option>
            {availableShows.map(s => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="lf-format" className="text-xs text-brand-text-muted pl-2">Format:</label>
          <select
            id="lf-format"
            value={format}
            onChange={e => setFormat(e.target.value)}
            className="text-xs bg-transparent text-brand-text-primary py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            <option value="all">All formats</option>
            {availableFormats.map(f => (
              <option key={f} value={f}>{FORMAT_LABELS[f] ?? f}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-brand-text-muted self-center">Showing {filtered.length}</p>
      </div>

      <div className="space-y-2">
        {filtered.map((c, i) => {
          const t = tierFor(c.quality);
          return (
            <Link
              key={`${c.showSlug}-${c.name}`}
              href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
              className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-lg px-4 py-3 hover:border-brand-gold/40 transition-colors group"
            >
              <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0">#{i + 1}</span>
              {c.profilePath ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-brand-surface">
                  <Image
                    src={charImageSrc(c.profilePath)!}
                    alt={c.actor || c.fullName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                  <span className="text-sm text-brand-text-muted">{c.fullName[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                  {c.fullName}
                </p>
                <p className="text-xs text-brand-text-muted truncate">
                  {c.showName} &middot; {c.totalJokes.toLocaleString()} jokes &middot; {c.episodesAppeared} eps
                </p>
                <div className="relative h-1.5 mt-1.5 bg-brand-surface rounded-full overflow-visible">
                  <div className={`absolute h-full rounded-full ${t.bar}`} style={{ width: `${barPct(c.quality)}%` }} />
                  <div className="absolute top-[-2px] h-[calc(100%+4px)] w-px bg-rose-400/60" style={{ left: `${barPct(REPLACEMENT)}%` }} title="Replacement" />
                  <div className="absolute top-[-2px] h-[calc(100%+4px)] w-px bg-brand-text-muted/60" style={{ left: `${barPct(LEAGUE_MEDIAN)}%` }} title="League median" />
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3 sm:gap-4">
                {c.vsCastmates != null && (
                  <div className="w-28">
                    <p className={`font-mono text-sm ${c.vsCastmates <= -0.15 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {c.vsCastmates >= 0 ? '+' : ''}{c.vsCastmates.toFixed(3)}
                      {c.vsCastmatesCiHalf != null && (
                        <span className="text-brand-text-muted"> ±{c.vsCastmatesCiHalf.toFixed(2)}</span>
                      )}
                    </p>
                    <p className="text-[10px] text-brand-text-muted">vs cast · {c.vsCastmatesEps} eps</p>
                  </div>
                )}
                <div className="w-14 hidden sm:block">
                  <p className={`font-mono text-sm ${t.color}`}>{c.quality.toFixed(2)}</p>
                  <p className="text-[10px] text-brand-text-muted">avg</p>
                </div>
                {c.peakQuality != null && (
                  <div className="w-14 hidden sm:block">
                    <p className={`font-mono text-sm ${c.peakQuality >= 7.75 ? 'text-emerald-400' : c.peakQuality >= 7.5 ? 'text-brand-gold' : 'text-brand-text-primary'}`}>
                      {c.peakQuality.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-brand-text-muted">peak</p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-brand-text-muted">
          No characters match this filter.
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SocialShare from '@/components/ui/SocialShare';

export interface CharacterCompareItem {
  name: string;
  showName: string;
  showSlug: string;
  total_jokes: number;
  episodes_appeared: number;
  avg_craft: number;
  avg_impact: number;
  war: number;
  war_per_episode: number;
  quality_index: number;
  actor?: string;
  profile_path?: string;
  character_full_name?: string;
  dominant_types?: string[];
}

interface Props {
  characters: CharacterCompareItem[];
}

const SUGGESTED_MATCHUPS: Array<[string, string]> = [
  ['George', 'Michael'],
  ['Jerry', 'Dwight'],
  ['Kramer', 'Chandler'],
  ['Elaine', 'Phoebe'],
  ['Michael', 'Chandler'],
  ['George', 'Jim'],
];

function charKey(c: CharacterCompareItem) {
  return `${c.showSlug}::${c.name}`;
}

export default function CompareCharactersClient({ characters }: Props) {
  const [a, setA] = useState<string>(() => charKey(characters[0]));
  const [b, setB] = useState<string>(() => charKey(characters[1] ?? characters[0]));

  const byKey = useMemo(() => {
    const m = new Map<string, CharacterCompareItem>();
    for (const c of characters) m.set(charKey(c), c);
    return m;
  }, [characters]);

  const cA = byKey.get(a);
  const cB = byKey.get(b);

  const metrics: Array<{ key: keyof CharacterCompareItem; label: string; format: (v: number) => string; higherIsBetter: boolean }> = [
    { key: 'total_jokes',       label: 'Total jokes',         format: v => v.toLocaleString(),         higherIsBetter: true  },
    { key: 'episodes_appeared', label: 'Episodes',            format: v => v.toLocaleString(),         higherIsBetter: true  },
    { key: 'war',               label: 'Total WAR',           format: v => v.toFixed(1),               higherIsBetter: true  },
    { key: 'war_per_episode',   label: 'WAR per episode',     format: v => v.toFixed(2),               higherIsBetter: true  },
    { key: 'quality_index',     label: 'Quality (shrunk)',    format: v => v.toFixed(2),               higherIsBetter: true  },
    { key: 'avg_craft',         label: 'Avg craft',           format: v => v.toFixed(2),               higherIsBetter: true  },
    { key: 'avg_impact',        label: 'Avg impact',          format: v => v.toFixed(2),               higherIsBetter: true  },
  ];

  const winsA = cA && cB ? metrics.filter(m => (cA[m.key] as number) > (cB[m.key] as number)).length : 0;
  const winsB = cA && cB ? metrics.filter(m => (cB[m.key] as number) > (cA[m.key] as number)).length : 0;

  return (
    <div>
      {/* Suggested matchups */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-brand-text-muted uppercase tracking-widest mr-2">Try</span>
        {SUGGESTED_MATCHUPS.map(([na, nb]) => {
          const charA = characters.find(c => c.name === na);
          const charB = characters.find(c => c.name === nb);
          if (!charA || !charB) return null;
          return (
            <button
              key={`${na}-${nb}`}
              onClick={() => {
                setA(charKey(charA));
                setB(charKey(charB));
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-secondary hover:border-brand-gold/40 hover:text-brand-text-primary transition-colors"
            >
              {na} vs {nb}
            </button>
          );
        })}
      </div>

      {/* Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-stretch mb-6">
        <CharacterSlot
          character={cA}
          onChange={setA}
          options={characters}
          side="A"
        />
        <div className="flex items-center justify-center text-sm text-brand-text-muted font-medium">
          vs
        </div>
        <CharacterSlot
          character={cB}
          onChange={setB}
          options={characters}
          side="B"
        />
      </div>

      {/* Metric rows */}
      {cA && cB && (
        <>
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            {metrics.map((m, idx) => {
              const va = cA[m.key] as number;
              const vb = cB[m.key] as number;
              const aWins = va > vb;
              const bWins = vb > va;
              return (
                <div
                  key={m.key}
                  className={`grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 text-sm gap-3 ${idx !== metrics.length - 1 ? 'border-b border-brand-border/60' : ''}`}
                >
                  <div className={`text-right font-mono ${aWins ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                    {m.format(va)}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-brand-text-muted text-center whitespace-nowrap">
                    {m.label}
                  </div>
                  <div className={`text-left font-mono ${bWins ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                    {m.format(vb)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verdict */}
          <div className="mt-5 p-4 bg-brand-surface border border-brand-border rounded-xl text-sm text-center">
            <span className="text-brand-text-muted">
              Edges wins: <span className="text-brand-text-primary font-medium">{cA.name}</span>{' '}
              {winsA} · <span className="text-brand-text-primary font-medium">{cB.name}</span> {winsB}
            </span>
            <p className="text-xs text-brand-text-muted mt-2">
              &quot;Winner&quot; is the sum of dimension edges. Heads-up: per our{' '}
              <Link href="/blog/scorer-noise-floor" className="text-brand-gold hover:underline">noise-floor analysis</Link>,
              small gaps in craft/impact (&lt;0.1) are likely within scorer noise.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
            <SocialShare
              title={`${cA.name} vs ${cB.name} — The Humor Index`}
              text={`${cA.name} (${cA.showName}) vs ${cB.name} (${cB.showName}) on the Humor Index — who actually wins?`}
              url="/compare/characters"
            />
            <Link
              href="/rankings/funniest-characters"
              className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
            >
              All characters ranked →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function CharacterSlot({
  character,
  onChange,
  options,
  side,
}: {
  character?: CharacterCompareItem;
  onChange: (v: string) => void;
  options: CharacterCompareItem[];
  side: 'A' | 'B';
}) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
      {character?.profile_path ? (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-brand-surface">
          <Image
            src={`https://image.tmdb.org/t/p/w185${character.profile_path}`}
            alt={character.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-lg bg-brand-surface flex items-center justify-center text-brand-text-muted text-xl font-mono flex-shrink-0">
          {character?.name[0] ?? '—'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">Fighter {side}</p>
        <select
          value={character ? charKey(character) : ''}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent border border-brand-border rounded-md text-sm text-brand-text-primary py-1 px-2 focus:outline-none focus:border-brand-gold cursor-pointer"
        >
          {options.map(c => (
            <option key={charKey(c)} value={charKey(c)}>
              {c.name} — {c.showName}
            </option>
          ))}
        </select>
        {character?.actor && (
          <p className="text-[11px] text-brand-text-muted mt-1 truncate">
            {character.actor}
          </p>
        )}
      </div>
    </div>
  );
}

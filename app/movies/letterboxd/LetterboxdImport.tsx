'use client';
import { useState } from 'react';
import Link from 'next/link';

interface M { slug: string; title: string; short: string; year: number; hi: number; rank: number }
interface Match { m: M; stars: number }

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Minimal CSV parser: handles quoted fields with commas and doubled quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}

export default function LetterboxdImport({ movies }: { movies: M[] }) {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState('');

  const onFile = async (f: File) => {
    setError('');
    const rows = parseCsv(await f.text());
    const head = rows[0]?.map(h => h.trim().toLowerCase()) ?? [];
    const iName = head.indexOf('name'), iYear = head.indexOf('year'), iRating = head.indexOf('rating');
    if (iName < 0 || iRating < 0) {
      setError('That file has no Name and Rating columns. Use ratings.csv from your Letterboxd export (Settings, Import & Export, Export your data).');
      return;
    }
    const out: Match[] = [];
    for (const r of rows.slice(1)) {
      const stars = parseFloat(r[iRating]);
      if (!stars) continue;
      const name = norm(r[iName] ?? ''), year = parseInt(r[iYear] ?? '', 10);
      const m = movies.find(x => (norm(x.title) === name || norm(x.short) === name) && (!year || Math.abs(x.year - year) <= 1));
      if (m && !out.some(o => o.m.slug === m.slug)) out.push({ m, stars });
    }
    setMatches(out.sort((a, b) => b.stars - a.stars || a.m.rank - b.m.rank));
  };

  // Your order vs ours: rank each list and compare positions.
  const verdict = (() => {
    if (!matches || matches.length < 3) return '';
    const yours = [...matches].sort((a, b) => b.stars - a.stars).map(x => x.m.slug);
    const ours = [...matches].sort((a, b) => b.m.hi - a.m.hi).map(x => x.m.slug);
    const n = yours.length;
    const d2 = yours.reduce((t, s, i) => t + (i - ours.indexOf(s)) ** 2, 0);
    const rho = 1 - (6 * d2) / (n * (n * n - 1));
    return rho > 0.5 ? 'Your taste lines up with the jokes.' : rho > 0 ? 'You and the Index mostly agree, with a few fights.' : rho > -0.5 ? 'You and the Index see comedy differently.' : 'You rate these almost exactly backwards from the jokes.';
  })();

  return (
    <div className="space-y-6">
      <label className="block rounded-xl border border-dashed border-brand-border bg-brand-card p-6 text-center cursor-pointer hover:border-brand-gold/50">
        <span className="block text-brand-text-primary">Choose your Letterboxd ratings.csv</span>
        <span className="block text-xs text-brand-text-muted mt-1">Letterboxd: Settings, Import &amp; Export, Export your data. Unzip it and pick ratings.csv.</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      {error && <p className="text-sm text-brand-red">{error}</p>}
      {matches && (
        matches.length === 0 ? (
          <p className="text-sm text-brand-text-secondary">None of your rated films are on our list yet. We&rsquo;ve scored {movies.length} so far; <Link href="/movies" className="text-brand-gold hover:underline">see which</Link>.</p>
        ) : (
          <div>
            <p className="text-brand-text-primary mb-1">{matches.length} of your rated films are on our list. {verdict}</p>
            <p className="text-xs text-brand-text-muted mb-4">Your stars on the left, the Humor Index and its rank among the {movies.length} films we&rsquo;ve scored on the right.</p>
            <ol className="space-y-2">
              {matches.map(x => (
                <li key={x.m.slug}>
                  <Link href={`/movies/${x.m.slug}/`} className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-3 hover:border-brand-gold/40">
                    <span className="w-20 font-mono text-sm text-brand-text-primary">{'★'.repeat(Math.floor(x.stars))}{x.stars % 1 ? '½' : ''}</span>
                    <span className="flex-1 text-brand-text-primary truncate">{x.m.short} <span className="text-brand-text-muted text-sm">({x.m.year})</span></span>
                    <span className="text-right"><span className="font-mono text-brand-gold">{x.m.hi.toFixed(1)}</span> <span className="text-xs text-brand-text-muted">#{x.m.rank}</span></span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )
      )}
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { tasteVsIndex, starText } from '@/lib/profile/tasteMath';

export const dynamic = 'force-dynamic';

const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const KIND_LABEL: Record<string, string> = { episode: 'Episode', movie: 'Movie', show: 'Series' };

interface Profile { id: string; handle: string; display_name: string | null; bio: string | null; created_at: string }
interface Log { id: number; kind: string; title: string; subtitle: string | null; href: string; hi: number | null; stars: number | null; watched_on: string; rewatch: boolean; note: string | null }
interface Item { kind: string; ref: string; title: string; subtitle: string | null; href: string; hi: number | null; position: number }
interface List { id: number; title: string; description: string | null; list_items: Item[] }

async function load(handle: string) {
  if (!configured || !/^[a-z0-9_]{3,20}$/.test(handle)) return null;
  const supabase = createClient();
  const { data: p } = await supabase.from('public_profiles').select('id, handle, display_name, bio, created_at').eq('handle', handle).maybeSingle();
  if (!p) return null;
  const profile = p as Profile;
  const [logsRes, listsRes] = await Promise.all([
    supabase.from('logs').select('id, kind, title, subtitle, href, hi, stars, watched_on, rewatch, note')
      .eq('user_id', profile.id).order('watched_on', { ascending: false }).order('id', { ascending: false }).limit(300),
    supabase.from('lists').select('id, title, description, list_items(kind, ref, title, subtitle, href, hi, position)')
      .eq('user_id', profile.id).eq('is_public', true).order('updated_at', { ascending: false }),
  ]);
  const logs = ((logsRes.data ?? []) as Log[]).map((l) => ({
    ...l,
    hi: l.hi === null ? null : Number(l.hi),
    stars: l.stars === null ? null : Number(l.stars),
  }));
  const lists = ((listsRes.data ?? []) as List[]).map((l) => ({
    ...l,
    list_items: [...(l.list_items ?? [])].sort((a, b) => a.position - b.position),
  }));
  return { profile, logs, lists };
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const data = await load(params.handle);
  if (!data) return { title: 'Profile not found', robots: { index: false } };
  const name = data.profile.display_name || `@${data.profile.handle}`;
  return {
    title: `${name}’s comedy diary`,
    description: `${data.logs.length} episodes and movies logged on The Humor Index.${data.profile.bio ? ` ${data.profile.bio}` : ''}`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicProfile({ params }: { params: { handle: string } }) {
  const data = await load(params.handle);
  if (!data) notFound();
  const { profile, logs, lists } = data;
  const name = profile.display_name || `@${profile.handle}`;
  const rated = logs.filter((l) => l.stars !== null);
  const avg = rated.length ? rated.reduce((s, l) => s + (l.stars ?? 0), 0) / rated.length : null;
  const taste = tasteVsIndex(logs);
  const year = String(new Date().getFullYear());
  const favourites = rated
    .filter((l) => (l.stars ?? 0) >= 4.5)
    .filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i)
    .slice(0, 6);
  const since = new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      <header>
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-2">Comedy diary</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary">{name}</h1>
        <p className="mt-1 font-mono text-sm text-brand-text-muted">@{profile.handle} · since {since}</p>
        {profile.bio && <p className="mt-3 max-w-2xl text-brand-text-secondary">{profile.bio}</p>}
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Logged', String(logs.length)],
          ['This year', String(logs.filter((l) => l.watched_on.startsWith(year)).length)],
          ['Episodes · movies', `${logs.filter((l) => l.kind === 'episode').length} · ${logs.filter((l) => l.kind === 'movie').length}`],
          ['Average rating', avg !== null ? avg.toFixed(1) : '–'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-brand-border bg-brand-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-brand-text-muted">{k}</p>
            <p className="mt-1 font-mono text-xl text-brand-text-primary">{v}</p>
          </div>
        ))}
      </div>

      {taste && (
        <p className="rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm text-brand-text-secondary">
          <strong className="text-brand-text-primary">Taste vs the Index:</strong> across {taste.n} rated logs, {name}’s stars and the Humor Index
          correlate at r = <span className="font-mono text-brand-gold">{taste.r.toFixed(2)}</span>.
        </p>
      )}

      {favourites.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-brand-text-primary mb-3">Top rated</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {favourites.map((l) => (
              <Link key={l.id} href={l.href} className="rounded-lg border border-brand-border bg-brand-card px-4 py-3 hover:border-brand-gold">
                <p className="truncate text-brand-text-primary">{l.title}</p>
                <p className="text-xs text-brand-text-muted truncate">
                  <span className="text-brand-gold">{starText(l.stars)}</span>
                  {l.subtitle ? ` · ${l.subtitle}` : ''}{l.hi !== null ? ` · HI ${l.hi.toFixed(1)}` : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lists.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-brand-text-primary mb-3">Lists</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {lists.map((l) => (
              <div key={l.id} className="rounded-xl border border-brand-border bg-brand-card p-4">
                <Link href={`/u/${profile.handle}/lists/${l.id}/`} className="font-medium text-brand-text-primary hover:text-brand-gold">{l.title}</Link>
                {l.description && <p className="mt-1 text-sm text-brand-text-secondary">{l.description}</p>}
                <ol className="mt-3 space-y-1.5">
                  {l.list_items.map((i, n) => (
                    <li key={`${i.kind}:${i.ref}`} className="flex gap-2 text-sm">
                      <span className="w-5 font-mono text-xs text-brand-text-muted pt-0.5">{n + 1}</span>
                      <Link href={i.href} className="min-w-0 truncate text-brand-text-secondary hover:text-brand-gold">
                        {i.title}{i.subtitle ? <span className="text-brand-text-muted"> · {i.subtitle}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-brand-text-primary mb-3">Diary</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-brand-text-muted">Nothing logged yet.</p>
        ) : (
          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
            {logs.slice(0, 100).map((l) => (
              <li key={l.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-20 shrink-0 font-mono text-xs text-brand-text-muted">{l.watched_on}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={l.href} className="block truncate text-brand-text-primary hover:text-brand-gold">{l.title}</Link>
                    <p className="truncate text-xs text-brand-text-muted">{KIND_LABEL[l.kind] ?? ''}{l.subtitle ? ` · ${l.subtitle}` : ''}{l.rewatch ? ' · rewatch' : ''}</p>
                  </div>
                  <span className="shrink-0 text-sm text-brand-gold">{starText(l.stars)}</span>
                  {l.hi !== null && <span className="hidden sm:inline shrink-0 font-mono text-xs text-brand-text-muted">HI {l.hi.toFixed(1)}</span>}
                </div>
                {l.note && <p className="mt-1.5 sm:ml-[92px] text-sm text-brand-text-secondary whitespace-pre-line">{l.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-brand-text-muted">
        Keep your own diary: <Link href="/my/#diary" className="text-brand-gold hover:underline">start logging</Link>.
      </p>
    </main>
  );
}

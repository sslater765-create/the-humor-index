import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const KIND_LABEL: Record<string, string> = { episode: 'Episode', movie: 'Movie', show: 'Series' };

interface Item { kind: string; ref: string; title: string; subtitle: string | null; href: string; hi: number | null; note: string | null; position: number }

async function load(handle: string, id: string) {
  if (!configured || !/^[a-z0-9_]{3,20}$/.test(handle) || !/^\d+$/.test(id)) return null;
  const supabase = createClient();
  const { data: p } = await supabase.from('public_profiles').select('id, handle, display_name').eq('handle', handle).maybeSingle();
  if (!p) return null;
  const profile = p as { id: string; handle: string; display_name: string | null };
  // RLS only returns a list when it and its owner are public.
  const { data: l } = await supabase
    .from('lists')
    .select('id, title, description, updated_at, user_id, list_items(kind, ref, title, subtitle, href, hi, note, position)')
    .eq('id', Number(id))
    .eq('user_id', profile.id)
    .maybeSingle();
  if (!l) return null;
  const list = l as { id: number; title: string; description: string | null; updated_at: string; list_items: Item[] };
  const items = [...(list.list_items ?? [])].sort((a, b) => a.position - b.position).map((i) => ({ ...i, hi: i.hi === null ? null : Number(i.hi) }));
  return { profile, list, items };
}

export async function generateMetadata({ params }: { params: { handle: string; id: string } }): Promise<Metadata> {
  const d = await load(params.handle, params.id);
  if (!d) return { title: 'List not found', robots: { index: false } };
  const by = d.profile.display_name || `@${d.profile.handle}`;
  return {
    title: `${d.list.title}, a list by ${by}`,
    description: `${d.items.length} picks${d.list.description ? `: ${d.list.description}` : ''}`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicList({ params }: { params: { handle: string; id: string } }) {
  const d = await load(params.handle, params.id);
  if (!d) notFound();
  const { profile, list, items } = d;
  const by = profile.display_name || `@${profile.handle}`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-2">A list by <Link href={`/u/${profile.handle}/`} className="hover:underline">{by}</Link></p>
      <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary">{list.title}</h1>
      {list.description && <p className="mt-3 text-brand-text-secondary">{list.description}</p>}
      <p className="mt-2 text-xs text-brand-text-muted">{items.length} {items.length === 1 ? 'pick' : 'picks'}</p>

      <ol className="mt-8 space-y-3">
        {items.map((i, n) => (
          <li key={`${i.kind}:${i.ref}`} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0">{n + 1}</span>
              <div className="min-w-0 flex-1">
                <Link href={i.href} className="text-brand-text-primary hover:text-brand-gold">{i.title}</Link>
                <p className="text-xs text-brand-text-muted">{KIND_LABEL[i.kind] ?? ''}{i.subtitle ? ` · ${i.subtitle}` : ''}</p>
                {i.note && <p className="mt-1.5 text-sm text-brand-text-secondary">{i.note}</p>}
              </div>
              {i.hi !== null && <span className="font-mono text-sm text-brand-gold shrink-0" title="Humor Index">{i.hi.toFixed(1)}</span>}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-brand-text-muted">
        Make your own: log anything on the site, then add it to a list. <Link href="/my/#lists" className="text-brand-gold hover:underline">Start here</Link>.
      </p>
    </main>
  );
}

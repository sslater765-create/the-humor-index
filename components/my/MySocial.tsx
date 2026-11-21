'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';
import StarInput from '@/components/log/StarInput';
import { rememberReturn } from '@/components/log/LogButton';
import {
  currentUser, myLogs, myLists, deleteLog, updateLog, updateList, deleteList, removeFromList, moveInList,
  getPublicSettings, savePublicSettings, tasteVsIndex, starText, HANDLE_RE, updateListItemNote, diaryCsv,
  type ListRow, type LogRow, type PublicSettings,
} from '@/lib/profile/social';

const KIND_LABEL = { episode: 'Episode', movie: 'Movie', show: 'Series' } as const;

function monthLabel(d: string) {
  const [y, m] = d.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function rText(r: number) {
  const a = Math.abs(r);
  const word = a >= 0.6 ? 'closely' : a >= 0.35 ? 'fairly well' : a >= 0.15 ? 'a little' : 'hardly at all';
  return r < 0 && a >= 0.15 ? 'in the opposite direction' : word;
}

function Section({ id, title, children, right }: { id: string; title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

/** Poster for a diary row: an episode or show uses its show's poster, a movie its own. */
function posterFor(l: { kind: string; ref: string }, posters: Record<string, string>): string | null {
  const slug = l.kind === 'movie' ? `movie:${l.ref}` : `show:${l.ref.split('/')[0]}`;
  return posters[slug] ?? null;
}

function Poster({ path }: { path: string | null }) {
  if (!path) return <span className="w-7 h-10 shrink-0 rounded bg-brand-surface border border-brand-border" aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://image.tmdb.org/t/p/w92${path}`} alt="" width={28} height={40} loading="lazy" className="w-7 h-10 shrink-0 rounded object-cover border border-brand-border" />
  );
}

export default function MySocial({ posters = {} }: { posters?: Record<string, string> }) {
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [lists, setLists] = useState<ListRow[]>([]);
  const [settings, setSettings] = useState<PublicSettings>({ handle: null, display_name: null, bio: null, is_public: false });
  const [savedHandle, setSavedHandle] = useState<string | null>(null);
  const [savedPublic, setSavedPublic] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [shareMsg, setShareMsg] = useState('');

  async function load(id: string) {
    const [l, ls, s] = await Promise.all([myLogs(id), myLists(id), getPublicSettings(id)]);
    if (l.missing || ls.missing || s.missing) { setMissing(true); return; }
    if (l.ok && l.data) setLogs(l.data);
    if (ls.ok && ls.data) setLists(ls.data);
    if (s.ok && s.data) { setSettings(s.data); setSavedHandle(s.data.handle); setSavedPublic(s.data.is_public); }
  }

  useEffect(() => {
    if (!supabaseConfigured) { setReady(true); return; }
    let live = true;
    currentUser().then(async (u) => {
      if (!live) return;
      setUid(u?.id ?? null);
      if (u) await load(u.id);
      if (live) setReady(true);
    });
    const { data: sub } = createClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) { setUid(session.user.id); void load(session.user.id); }
      if (event === 'SIGNED_OUT') { setUid(null); setLogs([]); setLists([]); }
    });
    return () => { live = false; sub.subscription.unsubscribe(); };
  }, []);

  const stats = useMemo(() => {
    const rated = logs.filter((l) => l.stars !== null);
    const avg = rated.length ? rated.reduce((s, l) => s + (l.stars ?? 0), 0) / rated.length : null;
    const year = String(new Date().getFullYear());
    return {
      total: logs.length,
      episodes: logs.filter((l) => l.kind === 'episode').length,
      movies: logs.filter((l) => l.kind === 'movie').length,
      thisYear: logs.filter((l) => l.watched_on.startsWith(year)).length,
      avg,
      taste: tasteVsIndex(logs),
    };
  }, [logs]);

  // The diary loads after the page does, so a /my/#diary link lands at the top.
  // Scroll once the section exists.
  useEffect(() => {
    if (!ready) return;
    const id = window.location.hash.slice(1);
    if (!['diary', 'lists', 'public-profile'].includes(id)) return;
    const el = document.getElementById(id);
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [ready, missing, uid]);

  const byMonth = useMemo(() => {
    const groups: { label: string; rows: LogRow[] }[] = [];
    for (const l of logs) {
      const label = monthLabel(l.watched_on);
      if (!groups.length || groups[groups.length - 1].label !== label) groups.push({ label, rows: [] });
      groups[groups.length - 1].rows.push(l);
    }
    return groups;
  }, [logs]);

  if (!supabaseConfigured || !ready) return null;

  if (!uid) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border bg-brand-card px-4 py-3">
        <p className="text-sm text-brand-text-secondary">
          <span className="text-brand-text-primary font-medium">Keep a comedy diary.</span> Log what you watch, rate it, make lists, and see how your taste lines up with the Index.
        </p>
        <Link
          href="/signin/"
          onClick={() => rememberReturn('/my/#diary')}
          className="shrink-0 rounded-full bg-brand-gold px-4 py-1.5 text-sm font-semibold text-black"
        >
          Sign in to start
        </Link>
      </div>
    );
  }

  if (missing) {
    return (
      <p className="rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-text-secondary">
        The diary and lists aren’t switched on yet. They’ll appear here soon.
      </p>
    );
  }

  function downloadCsv() {
    const blob = new Blob([diaryCsv(logs)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humor-index-diary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareProfile() {
    if (!savedHandle) return;
    const url = `${window.location.origin}/u/${savedHandle}/`;
    const text = stats.taste
      ? `My comedy diary on The Humor Index: ${stats.total} logged, and my taste tracks the Index at r = ${stats.taste.r.toFixed(2)}.`
      : `My comedy diary on The Humor Index: ${stats.total} logged.`;
    try {
      if (navigator.share) { await navigator.share({ title: 'My comedy diary', text, url }); return; }
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied');
      window.setTimeout(() => setShareMsg(''), 2500);
    } catch {
      /* dismissed */
    }
  }

  async function noteItem(list: ListRow, kind: LogRow['kind'], ref: string, note: string) {
    setLists((ls) => ls.map((l) => (l.id === list.id ? { ...l, list_items: l.list_items.map((i) => (i.kind === kind && i.ref === ref ? { ...i, note: note || null } : i)) } : l)));
    await updateListItemNote(list.id, kind, ref, note);
  }

  async function removeLog(id: number) {
    const r = await deleteLog(id);
    if (r.ok) setLogs((ls) => ls.filter((l) => l.id !== id));
  }

  async function restar(id: number, stars: number | null) {
    setLogs((ls) => ls.map((l) => (l.id === id ? { ...l, stars } : l)));
    await updateLog(id, { stars });
  }

  async function saveSettings() {
    if (!uid) return;
    setSettingsMsg('');
    const r = await savePublicSettings(uid, settings);
    if (!r.ok) { setSettingsMsg(r.error ?? 'Could not save.'); return; }
    const h = settings.handle ? settings.handle.trim().toLowerCase() : null;
    setSavedHandle(h);
    setSavedPublic(settings.is_public);
    setSettingsMsg('Saved.');
  }

  async function patchList(id: number, patch: Partial<{ title: string; is_public: boolean }>) {
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await updateList(id, patch);
  }

  async function dropList(id: number) {
    if (!window.confirm('Delete this list? The items stay in your diary.')) return;
    const r = await deleteList(id);
    if (r.ok) setLists((ls) => ls.filter((l) => l.id !== id));
  }

  async function dropItem(list: ListRow, kind: LogRow['kind'], ref: string) {
    const r = await removeFromList(list.id, kind, ref);
    if (r.ok) setLists((ls) => ls.map((l) => (l.id === list.id ? { ...l, list_items: l.list_items.filter((i) => !(i.kind === kind && i.ref === ref)) } : l)));
  }

  async function move(list: ListRow, index: number, dir: -1 | 1) {
    const r = await moveInList(list, index, dir);
    if (r.ok && r.data) setLists((ls) => ls.map((l) => (l.id === list.id ? { ...l, list_items: r.data ?? l.list_items } : l)));
  }

  const handleOk = !settings.handle || HANDLE_RE.test(settings.handle.trim().toLowerCase());

  return (
    <div className="space-y-14">
      <Section
        id="diary"
        title="Your diary"
        right={
          <span className="flex items-center gap-4 text-sm">
            {logs.length > 0 && (
              <button type="button" onClick={downloadCsv} className="text-brand-text-secondary hover:text-brand-gold">Export CSV</button>
            )}
            {savedPublic && savedHandle && (
              <>
                <button type="button" onClick={() => void shareProfile()} className="text-brand-text-secondary hover:text-brand-gold">{shareMsg || 'Share profile'}</button>
                <Link href={`/u/${savedHandle}/`} className="text-brand-gold hover:underline">View public profile →</Link>
              </>
            )}
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            ['Logged', String(stats.total)],
            ['This year', String(stats.thisYear)],
            ['Episodes · movies', `${stats.episodes} · ${stats.movies}`],
            ['Average rating', stats.avg !== null ? stats.avg.toFixed(1) : '–'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-brand-border bg-brand-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-brand-text-muted">{k}</p>
              <p className="mt-1 font-mono text-xl text-brand-text-primary">{v}</p>
            </div>
          ))}
        </div>

        {stats.taste ? (
          <p className="mb-6 rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm text-brand-text-secondary">
            <strong className="text-brand-text-primary">You and the Index:</strong> across {stats.taste.n} rated logs, your stars track the Humor Index {rText(stats.taste.r)} (r = <span className="font-mono">{stats.taste.r.toFixed(2)}</span>).
            {' '}The Index counts jokes and grades their construction; your stars measure what landed for you. The gap between the two is your taste.
          </p>
        ) : logs.length > 0 ? (
          <p className="mb-6 text-sm text-brand-text-muted">Rate five logs and we’ll show how closely your taste tracks the Index.</p>
        ) : null}

        {logs.length === 0 ? (
          <p className="text-sm text-brand-text-secondary">
            Nothing logged yet. Hit <span className="text-brand-gold">+ Log it</span> on any{' '}
            <Link href="/shows/" className="text-brand-gold hover:underline">episode</Link> or{' '}
            <Link href="/movies/" className="text-brand-gold hover:underline">movie</Link> page.
          </p>
        ) : (
          <div className="space-y-6">
            {byMonth.map((g) => (
              <div key={g.label}>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-text-muted mb-2">{g.label}</p>
                <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
                  {g.rows.map((l) => (
                    <li key={l.id} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 shrink-0 font-mono text-sm text-brand-text-muted">{l.watched_on.slice(8)}</span>
                        <Poster path={posterFor(l, posters)} />
                        <div className="min-w-0 flex-1">
                          <Link href={l.href} className="block truncate text-brand-text-primary hover:text-brand-gold">{l.title}</Link>
                          <p className="truncate text-xs text-brand-text-muted">
                            {KIND_LABEL[l.kind]}{l.subtitle ? ` · ${l.subtitle}` : ''}{l.rewatch ? ' · rewatch' : ''}
                          </p>
                        </div>
                        <span className="shrink-0 text-brand-gold text-sm">{starText(l.stars)}</span>
                        {l.hi !== null && l.hi !== undefined && (
                          <span className="hidden sm:inline shrink-0 font-mono text-xs text-brand-text-muted" title="Humor Index">HI {l.hi.toFixed(1)}</span>
                        )}
                        <button type="button" onClick={() => setEditing(editing === l.id ? null : l.id)} className="shrink-0 text-xs text-brand-text-muted hover:text-brand-text-primary">
                          {editing === l.id ? 'Close' : 'Edit'}
                        </button>
                      </div>
                      {l.note && editing !== l.id && <p className="mt-1.5 ml-[4.75rem] text-sm text-brand-text-secondary whitespace-pre-line">{l.note}</p>}
                      {editing === l.id && (
                        <div className="mt-3 ml-[4.75rem] flex flex-wrap items-center gap-4">
                          <StarInput value={l.stars} onChange={(v) => void restar(l.id, v)} size={22} />
                          <button type="button" onClick={() => void removeLog(l.id)} className="text-xs text-red-400 hover:underline">Delete this log</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="lists" title="Your lists">
        {lists.length === 0 ? (
          <p className="text-sm text-brand-text-secondary">
            No lists yet. Log something, then add it to a list from the same box: best cold opens, comfort rewatches, the five funniest Will Ferrell scenes.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {lists.map((l) => (
              <div key={l.id} className="rounded-xl border border-brand-border bg-brand-card p-4">
                <div className="flex items-start gap-2">
                  <input
                    defaultValue={l.title}
                    maxLength={80}
                    onBlur={(e) => { const t = e.target.value.trim(); if (t && t !== l.title) void patchList(l.id, { title: t }); }}
                    className="min-w-0 flex-1 bg-transparent text-brand-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold/50 rounded px-1 -mx-1"
                    aria-label="List title"
                  />
                  <button type="button" onClick={() => void dropList(l.id)} className="text-xs text-brand-text-muted hover:text-red-400">Delete</button>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs text-brand-text-muted">
                    <input type="checkbox" checked={l.is_public} onChange={(e) => void patchList(l.id, { is_public: e.target.checked })} className="accent-[#E8B931]" />
                    Show on my public profile
                  </label>
                  {l.is_public && savedPublic && savedHandle && (
                    <Link href={`/u/${savedHandle}/lists/${l.id}/`} className="text-xs text-brand-gold hover:underline">List page →</Link>
                  )}
                </div>
                {l.list_items.length === 0 ? (
                  <p className="mt-3 text-sm text-brand-text-muted">Empty. Add items from any Log box.</p>
                ) : (
                  <ol className="mt-3 space-y-1.5">
                    {l.list_items.map((i, n) => (
                      <li key={`${i.kind}:${i.ref}`} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 font-mono text-xs text-brand-text-muted">{n + 1}</span>
                          <Link href={i.href} className="min-w-0 flex-1 truncate text-brand-text-secondary hover:text-brand-gold">
                            {i.title}{i.subtitle ? <span className="text-brand-text-muted"> · {i.subtitle}</span> : null}
                          </Link>
                          <button type="button" aria-label="Move up" onClick={() => void move(l, n, -1)} disabled={n === 0} className="text-brand-text-muted disabled:opacity-30 hover:text-brand-text-primary">↑</button>
                          <button type="button" aria-label="Move down" onClick={() => void move(l, n, 1)} disabled={n === l.list_items.length - 1} className="text-brand-text-muted disabled:opacity-30 hover:text-brand-text-primary">↓</button>
                          <button type="button" aria-label="Remove" onClick={() => void dropItem(l, i.kind, i.ref)} className="text-brand-text-muted hover:text-red-400">×</button>
                        </div>
                        <input
                          defaultValue={i.note ?? ''}
                          maxLength={500}
                          placeholder="Add a note"
                          aria-label={`Note for ${i.title}`}
                          onBlur={(e) => { if ((e.target.value || null) !== (i.note || null)) void noteItem(l, i.kind, i.ref, e.target.value); }}
                          className="mt-0.5 ml-7 w-[calc(100%-1.75rem)] bg-transparent text-xs text-brand-text-muted placeholder:text-brand-text-muted/60 focus:outline-none focus:text-brand-text-secondary"
                        />
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="public-profile" title="Public profile">
        <div className="rounded-xl border border-brand-border bg-brand-card p-5 space-y-4 max-w-xl">
          <p className="text-sm text-brand-text-secondary">
            Off by default. Turn it on and anyone with the link can see your diary, ratings and public lists at
            {' '}<span className="font-mono text-brand-text-primary">thehumorindex.com/u/{settings.handle || 'yourname'}</span>. Your email is never shown.
          </p>
          <label className="block text-xs text-brand-text-muted">
            Handle
            <input
              value={settings.handle ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              maxLength={20}
              placeholder="lowercase, numbers, underscores"
              className={`mt-1 block w-full rounded-lg border bg-brand-surface px-3 py-2 text-sm font-mono text-brand-text-primary ${handleOk ? 'border-brand-border' : 'border-red-400'}`}
            />
          </label>
          <label className="block text-xs text-brand-text-muted">
            Display name
            <input
              value={settings.display_name ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, display_name: e.target.value }))}
              maxLength={50}
              className="mt-1 block w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-primary"
            />
          </label>
          <label className="block text-xs text-brand-text-muted">
            Bio
            <textarea
              value={settings.bio ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, bio: e.target.value }))}
              maxLength={280}
              rows={2}
              placeholder="Season 2 Office truther."
              className="mt-1 block w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-primary"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-text-secondary">
            <input type="checkbox" checked={settings.is_public} onChange={(e) => setSettings((s) => ({ ...s, is_public: e.target.checked }))} className="accent-[#E8B931]" />
            Make my profile public
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void saveSettings()} disabled={!handleOk} className="rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">Save</button>
            {settingsMsg && <span className="text-sm text-brand-text-secondary">{settingsMsg}</span>}
          </div>
        </div>
      </Section>
    </div>
  );
}

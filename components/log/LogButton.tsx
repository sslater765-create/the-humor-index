'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseConfigured } from '@/lib/supabase/client';
import StarInput from './StarInput';
import {
  addLog, addToList, createList, currentUser, logsFor, myLists, starText, todayLocal,
  type ListRow, type LogRow, type Loggable,
} from '@/lib/profile/social';

/** Remember where to come back to after sign-in; the auth callback reads it. */
export function rememberReturn(path: string) {
  try {
    document.cookie = `hi_next=${encodeURIComponent(path)}; path=/; max-age=1800; samesite=lax`;
  } catch {
    /* ignore */
  }
}

function fmtDate(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LogButton({ item, className = '' }: { item: Loggable; className?: string }) {
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [past, setPast] = useState<LogRow[]>([]);
  const [open, setOpen] = useState(false);

  const [stars, setStars] = useState<number | null>(null);
  const [date, setDate] = useState(todayLocal());
  const [rewatch, setRewatch] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [lists, setLists] = useState<ListRow[] | null>(null);
  const [newList, setNewList] = useState('');
  const [listMsg, setListMsg] = useState('');

  useEffect(() => {
    if (!supabaseConfigured) { setReady(true); return; }
    let live = true;
    currentUser().then(async (u) => {
      if (!live) return;
      setUid(u?.id ?? null);
      if (u) {
        const r = await logsFor(u.id, item.kind, item.ref);
        if (live && r.ok && r.data) setPast(r.data);
      }
      if (live) setReady(true);
    });
    return () => { live = false; };
  }, [item.kind, item.ref]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!supabaseConfigured || !ready) return null;

  const pill =
    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors';

  if (!uid) {
    return (
      <Link
        href="/signin/"
        onClick={() => rememberReturn(window.location.pathname)}
        className={`${pill} border-brand-gold/70 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 ${className}`}
      >
        <span aria-hidden="true">+</span> Log it
      </Link>
    );
  }

  function openForm() {
    setStars(null);
    setDate(todayLocal());
    setRewatch(past.length > 0);
    setNote('');
    setError('');
    setSaved(false);
    setListMsg('');
    setOpen(true);
  }

  async function save() {
    if (!uid) return;
    setBusy(true);
    setError('');
    const r = await addLog(uid, item, { stars, watched_on: date, rewatch, note });
    setBusy(false);
    if (!r.ok || !r.data) { setError(r.error ?? 'Could not save.'); return; }
    setPast((p) => [r.data as LogRow].concat(p));
    setSaved(true);
    const l = await myLists(uid);
    setLists(l.ok && l.data ? l.data : []);
  }

  async function putInList(list: ListRow) {
    const r = await addToList(list, item);
    setListMsg(r.ok ? `Added to “${list.title}”.` : r.error ?? 'Could not add.');
  }

  async function makeList() {
    if (!uid || !newList.trim()) return;
    const r = await createList(uid, newList);
    if (!r.ok || !r.data) { setListMsg(r.error ?? 'Could not create the list.'); return; }
    await putInList(r.data);
    setLists((ls) => [r.data as ListRow].concat(ls ?? []));
    setNewList('');
  }

  const last = past[0];

  return (
    <>
      <button
        type="button"
        onClick={openForm}
        className={`${pill} ${past.length ? 'border-brand-gold/60 text-brand-gold' : 'border-brand-gold/70 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20'} ${className}`}
        title={last ? `Last logged ${fmtDate(last.watched_on)}` : 'Add this to your diary'}
      >
        {past.length ? (
          <>
            <span aria-hidden="true">✓</span> Logged{past.length > 1 ? ` ×${past.length}` : ''}
            {last?.stars !== null && last?.stars !== undefined && <span className="text-xs">{starText(last.stars)}</span>}
          </>
        ) : (
          <><span aria-hidden="true">+</span> Log it</>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Log ${item.title}`}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-gold">{saved ? 'In your diary' : 'Log it'}</p>
                <p className="mt-1 text-lg font-medium text-brand-text-primary truncate">{item.title}</p>
                {item.subtitle && <p className="text-sm text-brand-text-muted truncate">{item.subtitle}</p>}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-brand-text-muted hover:text-brand-text-primary text-xl leading-none" aria-label="Close">×</button>
            </div>

            {!saved ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-brand-text-muted mb-1.5">Your rating (optional)</p>
                  <StarInput value={stars} onChange={setStars} />
                  {item.hi !== null && item.hi !== undefined && (
                    <p className="mt-1 text-xs text-brand-text-muted">The Index has it at <span className="font-mono text-brand-gold">{item.hi.toFixed(1)}</span>.</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-xs text-brand-text-muted">
                    Watched on
                    <input
                      type="date"
                      value={date}
                      max={todayLocal()}
                      onChange={(e) => setDate(e.target.value || todayLocal())}
                      className="ml-2 rounded-md border border-brand-border bg-brand-card px-2 py-1 text-sm text-brand-text-primary"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <input type="checkbox" checked={rewatch} onChange={(e) => setRewatch(e.target.checked)} className="accent-[#E8B931]" />
                    Rewatch
                  </label>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="A line that got you, a note for later…"
                  className="w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-muted"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex items-center justify-between gap-3">
                  {past.length > 0 ? (
                    <p className="text-xs text-brand-text-muted">Logged {past.length} time{past.length > 1 ? 's' : ''} before, last on {fmtDate(past[0].watched_on)}.</p>
                  ) : <span />}
                  <button
                    type="button"
                    onClick={save}
                    disabled={busy}
                    className="rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-brand-text-secondary">
                  Saved{stars !== null ? <> at <span className="text-brand-gold">{starText(stars)}</span></> : ''}.{' '}
                  <Link href="/my/#diary" className="text-brand-gold hover:underline">See your diary</Link>
                </p>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand-text-muted mb-2">Add to a list</p>
                  {lists === null ? (
                    <p className="text-sm text-brand-text-muted">Loading…</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {lists.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => putInList(l)}
                          className="block w-full text-left rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-primary hover:border-brand-gold"
                        >
                          {l.title} <span className="text-brand-text-muted">· {l.list_items.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newList}
                      onChange={(e) => setNewList(e.target.value)}
                      maxLength={80}
                      placeholder="New list, e.g. Best cold opens"
                      className="flex-1 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-muted"
                      onKeyDown={(e) => { if (e.key === 'Enter') void makeList(); }}
                    />
                    <button type="button" onClick={makeList} className="rounded-lg border border-brand-gold/60 px-3 text-sm text-brand-gold">Create</button>
                  </div>
                  {listMsg && <p className="mt-2 text-sm text-brand-text-secondary">{listMsg}</p>}
                </div>
                <div className="text-right">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-brand-border px-5 py-2 text-sm text-brand-text-secondary hover:text-brand-text-primary">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

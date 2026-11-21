'use client';
// Diary logs, lists and the public-profile settings. Everything here needs a
// signed-in user and the 0003_social migration; every call resolves rather than
// throws, and reports `missing` when the tables aren't there yet so the UI can
// say so instead of breaking.
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

export type Kind = 'episode' | 'movie' | 'show';

/** What a page hands the Log button: enough to show the item anywhere else. */
export interface Loggable {
  kind: Kind;
  ref: string;
  title: string;
  subtitle?: string;
  href: string;
  hi?: number | null;
}

export interface LogRow extends Loggable {
  id: number;
  stars: number | null;
  watched_on: string;
  rewatch: boolean;
  note: string | null;
  created_at: string;
}

export interface ListItemRow extends Loggable {
  note: string | null;
  position: number;
}

export interface ListRow {
  id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  list_items: ListItemRow[];
}

export interface PublicSettings {
  handle: string | null;
  display_name: string | null;
  bio: string | null;
  is_public: boolean;
}

export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
  /** The 0003 migration hasn't been run yet. */
  missing?: boolean;
}

interface PgError { code?: string; message?: string }

function fail<T>(e: PgError | null | undefined): Result<T> {
  const code = e?.code ?? '';
  const msg = e?.message ?? 'Something went wrong.';
  // 42P01 undefined table, 42703 undefined column, PGRST205/PGRST204 schema cache misses
  const missing = code === '42P01' || code === '42703' || code.startsWith('PGRST20') || /does not exist|schema cache/i.test(msg);
  if (code === '23505') return { ok: false, error: 'That handle is taken. Try another.' };
  if (code === '23514') return { ok: false, error: 'That doesn’t fit the format. Check the field and try again.' };
  return { ok: false, error: missing ? 'Logging isn’t switched on yet.' : msg, missing };
}

export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function currentUser(): Promise<{ id: string; email: string | null } | null> {
  if (!supabaseConfigured) return null;
  try {
    const { data } = await createClient().auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
  } catch {
    return null;
  }
}

const LOG_COLS = 'id, kind, ref, title, subtitle, href, hi, stars, watched_on, rewatch, note, created_at';

function normLog(r: Record<string, unknown>): LogRow {
  return {
    id: Number(r.id),
    kind: r.kind as Kind,
    ref: String(r.ref),
    title: String(r.title),
    subtitle: (r.subtitle as string | null) ?? undefined,
    href: String(r.href),
    hi: r.hi === null || r.hi === undefined ? null : Number(r.hi),
    stars: r.stars === null || r.stars === undefined ? null : Number(r.stars),
    watched_on: String(r.watched_on),
    rewatch: Boolean(r.rewatch),
    note: (r.note as string | null) ?? null,
    created_at: String(r.created_at),
  };
}

// ---------------------------------------------------------------- logs

export async function addLog(
  uid: string,
  item: Loggable,
  entry: { stars: number | null; watched_on: string; rewatch: boolean; note: string },
): Promise<Result<LogRow>> {
  const { data, error } = await createClient()
    .from('logs')
    .insert({
      user_id: uid,
      kind: item.kind,
      ref: item.ref,
      title: item.title,
      subtitle: item.subtitle ?? null,
      href: item.href,
      hi: item.hi ?? null,
      stars: entry.stars,
      watched_on: entry.watched_on,
      rewatch: entry.rewatch,
      note: entry.note.trim() || null,
    })
    .select(LOG_COLS)
    .single();
  if (error) return fail(error);
  return { ok: true, data: normLog(data as Record<string, unknown>) };
}

export async function updateLog(
  id: number,
  patch: Partial<{ stars: number | null; watched_on: string; rewatch: boolean; note: string | null }>,
): Promise<Result<null>> {
  const { error } = await createClient().from('logs').update(patch).eq('id', id);
  return error ? fail(error) : { ok: true };
}

export async function deleteLog(id: number): Promise<Result<null>> {
  const { error } = await createClient().from('logs').delete().eq('id', id);
  return error ? fail(error) : { ok: true };
}

export async function logsFor(uid: string, kind: Kind, ref: string): Promise<Result<LogRow[]>> {
  const { data, error } = await createClient()
    .from('logs')
    .select(LOG_COLS)
    .eq('user_id', uid)
    .eq('kind', kind)
    .eq('ref', ref)
    .order('watched_on', { ascending: false });
  if (error) return fail(error);
  return { ok: true, data: (data ?? []).map((r) => normLog(r as Record<string, unknown>)) };
}

export async function myLogs(uid: string, limit = 200): Promise<Result<LogRow[]>> {
  const { data, error } = await createClient()
    .from('logs')
    .select(LOG_COLS)
    .eq('user_id', uid)
    .order('watched_on', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);
  if (error) return fail(error);
  return { ok: true, data: (data ?? []).map((r) => normLog(r as Record<string, unknown>)) };
}

// ---------------------------------------------------------------- lists

const LIST_COLS = 'id, title, description, is_public, updated_at, list_items(kind, ref, title, subtitle, href, hi, note, position)';

function normList(r: Record<string, unknown>): ListRow {
  const items = ((r.list_items as Record<string, unknown>[] | null) ?? [])
    .map((i) => ({
      kind: i.kind as Kind,
      ref: String(i.ref),
      title: String(i.title),
      subtitle: (i.subtitle as string | null) ?? undefined,
      href: String(i.href),
      hi: i.hi === null || i.hi === undefined ? null : Number(i.hi),
      note: (i.note as string | null) ?? null,
      position: Number(i.position ?? 0),
    }))
    .sort((a, b) => a.position - b.position);
  return {
    id: Number(r.id),
    title: String(r.title),
    description: (r.description as string | null) ?? null,
    is_public: Boolean(r.is_public),
    updated_at: String(r.updated_at),
    list_items: items,
  };
}

export async function myLists(uid: string): Promise<Result<ListRow[]>> {
  const { data, error } = await createClient()
    .from('lists')
    .select(LIST_COLS)
    .eq('user_id', uid)
    .order('updated_at', { ascending: false });
  if (error) return fail(error);
  return { ok: true, data: (data ?? []).map((r) => normList(r as Record<string, unknown>)) };
}

export async function createList(uid: string, title: string, description = ''): Promise<Result<ListRow>> {
  const { data, error } = await createClient()
    .from('lists')
    .insert({ user_id: uid, title: title.trim().slice(0, 80), description: description.trim() || null })
    .select(LIST_COLS)
    .single();
  if (error) return fail(error);
  return { ok: true, data: normList(data as Record<string, unknown>) };
}

export async function updateList(
  id: number,
  patch: Partial<{ title: string; description: string | null; is_public: boolean }>,
): Promise<Result<null>> {
  const { error } = await createClient()
    .from('lists')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  return error ? fail(error) : { ok: true };
}

export async function deleteList(id: number): Promise<Result<null>> {
  const { error } = await createClient().from('lists').delete().eq('id', id);
  return error ? fail(error) : { ok: true };
}

export async function addToList(list: ListRow, item: Loggable): Promise<Result<null>> {
  const position = list.list_items.reduce((m, i) => Math.max(m, i.position), -1) + 1;
  const supabase = createClient();
  const { error } = await supabase.from('list_items').upsert({
    list_id: list.id,
    kind: item.kind,
    ref: item.ref,
    title: item.title,
    subtitle: item.subtitle ?? null,
    href: item.href,
    hi: item.hi ?? null,
    position,
  });
  if (error) return fail(error);
  await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', list.id);
  return { ok: true };
}

export async function removeFromList(listId: number, kind: Kind, ref: string): Promise<Result<null>> {
  const { error } = await createClient()
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('kind', kind)
    .eq('ref', ref);
  return error ? fail(error) : { ok: true };
}

export async function updateListItemNote(listId: number, kind: Kind, ref: string, note: string): Promise<Result<null>> {
  const { error } = await createClient()
    .from('list_items')
    .update({ note: note.trim().slice(0, 500) || null })
    .eq('list_id', listId)
    .eq('kind', kind)
    .eq('ref', ref);
  return error ? fail(error) : { ok: true };
}

/** The diary as CSV, Letterboxd-style columns plus the Humor Index. */
export function diaryCsv(logs: LogRow[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['Watched Date', 'Kind', 'Title', 'Subtitle', 'Rating', 'Rewatch', 'Humor Index', 'Note', 'URL'];
  const rows = logs.map((l) => [l.watched_on, l.kind, l.title, l.subtitle ?? '', l.stars ?? '', l.rewatch ? 'Yes' : '', l.hi ?? '', l.note ?? '', `https://www.thehumorindex.com${l.href}`]);
  return [head, ...rows].map((r) => r.map(esc).join(',')).join('\n');
}

/** Swap an item with its neighbour. dir -1 = up, 1 = down. */
export async function moveInList(list: ListRow, index: number, dir: -1 | 1): Promise<Result<ListItemRow[]>> {
  const items = list.list_items.map((i, n) => ({ ...i, position: n }));
  const j = index + dir;
  if (j < 0 || j >= items.length) return { ok: true, data: items };
  const a = items[index];
  items[index] = { ...items[j], position: index };
  items[j] = { ...a, position: j };
  const supabase = createClient();
  const res = await Promise.all(
    [items[index], items[j]].map((i) =>
      supabase.from('list_items').update({ position: i.position }).eq('list_id', list.id).eq('kind', i.kind).eq('ref', i.ref),
    ),
  );
  const err = res.find((r) => r.error)?.error;
  return err ? fail(err) : { ok: true, data: items };
}

// ---------------------------------------------------------------- profile

export async function getPublicSettings(uid: string): Promise<Result<PublicSettings>> {
  const { data, error } = await createClient()
    .from('profiles')
    .select('handle, display_name, bio, is_public')
    .eq('id', uid)
    .maybeSingle();
  if (error) return fail(error);
  const r = (data ?? {}) as Partial<PublicSettings>;
  return {
    ok: true,
    data: {
      handle: r.handle ?? null,
      display_name: r.display_name ?? null,
      bio: r.bio ?? null,
      is_public: Boolean(r.is_public),
    },
  };
}

export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export async function savePublicSettings(uid: string, s: PublicSettings): Promise<Result<null>> {
  const handle = s.handle ? s.handle.trim().toLowerCase() : null;
  if (handle && !HANDLE_RE.test(handle)) {
    return { ok: false, error: 'Handles are 3 to 20 characters: lowercase letters, numbers and underscores.' };
  }
  if (s.is_public && !handle) return { ok: false, error: 'Pick a handle before making your profile public.' };
  const { error } = await createClient()
    .from('profiles')
    .update({
      handle,
      display_name: s.display_name?.trim() || null,
      bio: s.bio?.trim().slice(0, 280) || null,
      is_public: s.is_public,
    })
    .eq('id', uid);
  return error ? fail(error) : { ok: true };
}

export { tasteVsIndex, starText } from './tasteMath';

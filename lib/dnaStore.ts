'use client';
// Saved Comedy DNA profile. localStorage is the working copy for everyone;
// when a visitor is signed in it is mirrored to profiles.dna in Supabase
// (migration 0002_dna.sql) so it follows them across devices. Every DB step is
// best-effort: if accounts are off or the column doesn't exist yet, the
// profile simply stays local.
import { createClient, supabaseConfigured } from '@/lib/supabase/client';
import { getUserId } from '@/lib/profile/sync';
import { isProfile, pickRicher, type DnaProfile } from '@/lib/comedyDna';

const KEY = 'humor_index_dna';
export const DNA_EVENT = 'hi-dna-change';

export function loadLocal(): DnaProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return isProfile(p) ? p : null;
  } catch {
    return null;
  }
}

export function saveLocal(p: DnaProfile | null): void {
  try {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode or quota: the profile still lives in memory this visit */
  }
  try { window.dispatchEvent(new CustomEvent(DNA_EVENT)); } catch { /* SSR */ }
}

let uidPromise: Promise<string | null> | null = null;
function uid(): Promise<string | null> {
  if (!supabaseConfigured) return Promise.resolve(null);
  uidPromise ||= getUserId();
  return uidPromise;
}

/** On load: if signed in, take whichever copy (device or account) has more picks. */
export async function syncFromAccount(local: DnaProfile | null): Promise<DnaProfile | null> {
  const id = await uid();
  if (!id) return local;
  try {
    const { data, error } = await createClient().from('profiles').select('dna').eq('id', id).maybeSingle();
    if (error) return local;
    const remote = (data as { dna?: unknown } | null)?.dna;
    const best = pickRicher(local, isProfile(remote) ? remote : null);
    if (best && best !== remote) void pushToAccount(best);
    return best;
  } catch {
    return local;
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
/** Debounced write of the profile to the signed-in account. */
export function pushToAccount(p: DnaProfile | null): Promise<void> {
  return new Promise(resolve => {
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      try {
        const id = await uid();
        if (id) await createClient().from('profiles').upsert({ id, dna: p });
      } catch {
        /* column missing or offline: local copy is still saved */
      }
      resolve();
    }, 1200);
  });
}

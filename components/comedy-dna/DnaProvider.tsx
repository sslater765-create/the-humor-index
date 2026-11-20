'use client';
// Site-wide Comedy DNA context. Mounted once in the root layout with the show
// fingerprints and pool baseline (both computed at build time), so any page can
// show "your match", record a pick, or prompt a first pick.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyPick, buildWeights, emptyProfile, matchShows, meanFingerprint, normalizeFingerprints,
  type DnaProfile, type QuizJoke, type ShowFingerprint, type ShowMatch,
} from '@/lib/comedyDna';
import { loadLocal, pushToAccount, saveLocal, syncFromAccount } from '@/lib/dnaStore';

interface DnaCtx {
  /** False until the saved profile has been read (avoids a flash of "take the quiz"). */
  ready: boolean;
  profile: DnaProfile;
  hasProfile: boolean;
  matches: ShowMatch[];
  matchFor: (slug: string) => ShowMatch | undefined;
  record: (winner: QuizJoke, loser: QuizJoke) => void;
  undo: (winner: QuizJoke, loser: QuizJoke) => void;
  reset: () => void;
  fps: ShowFingerprint[];
  meanFp: number[];
  weights: number[];
  baseline: number[];
}

const Ctx = createContext<DnaCtx | null>(null);

export function DnaProvider({ fingerprints, baseline, children }: { fingerprints: ShowFingerprint[]; baseline: number[]; children: React.ReactNode }) {
  const fps = useMemo(() => normalizeFingerprints(fingerprints), [fingerprints]);
  const meanFp = useMemo(() => meanFingerprint(fps), [fps]);
  const weights = useMemo(() => buildWeights(meanFp), [meanFp]);
  const [profile, setProfile] = useState<DnaProfile>(emptyProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let on = true;
    const local = loadLocal();
    if (local) setProfile(local);
    setReady(true);
    syncFromAccount(local).then(p => {
      if (!on || !p || p === local) return;
      saveLocal(p);
      setProfile(p);
    });
    // Another tab (or another component) changed the profile.
    const refresh = () => { const p = loadLocal(); setProfile(p ?? emptyProfile()); };
    const onStorage = (e: StorageEvent) => { if (e.key === 'humor_index_dna') refresh(); };
    window.addEventListener('storage', onStorage);
    return () => { on = false; window.removeEventListener('storage', onStorage); };
  }, []);

  const commit = useCallback((next: DnaProfile | null) => {
    saveLocal(next);
    void pushToAccount(next);
    setProfile(next ?? emptyProfile());
  }, []);

  const record = useCallback((w: QuizJoke, l: QuizJoke) => {
    setProfile(prev => { const next = applyPick(prev, w, l, baseline, 1); saveLocal(next); void pushToAccount(next); return next; });
  }, [baseline]);
  const undo = useCallback((w: QuizJoke, l: QuizJoke) => {
    setProfile(prev => { const next = applyPick(prev, w, l, baseline, -1); saveLocal(next); void pushToAccount(next); return next; });
  }, [baseline]);
  const reset = useCallback(() => commit(null), [commit]);

  const matches = useMemo(() => matchShows(profile, fps, meanFp, weights), [profile, fps, meanFp, weights]);
  const bySlug = useMemo(() => Object.fromEntries(matches.map(m => [m.slug, m])), [matches]);
  const matchFor = useCallback((slug: string) => bySlug[slug], [bySlug]);

  const value = useMemo<DnaCtx>(() => ({
    ready, profile, hasProfile: profile.picks > 0, matches, matchFor, record, undo, reset, fps, meanFp, weights, baseline,
  }), [ready, profile, matches, matchFor, record, undo, reset, fps, meanFp, weights, baseline]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDna(): DnaCtx | null {
  return useContext(Ctx);
}

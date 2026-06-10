'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

export default function AccountMenu({ mobile = false }: { mobile?: boolean }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Hide entirely until accounts are switched on.
  if (!supabaseConfigured || !ready) return null;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    window.location.assign('/');
  }

  // Signed out
  if (!email) {
    return (
      <Link
        href="/signin"
        className={
          mobile
            ? 'block px-3 py-3 rounded-lg text-base font-medium text-brand-gold active:bg-brand-surface'
            : 'text-sm text-brand-gold hover:text-brand-text-primary transition-colors'
        }
      >
        Sign in
      </Link>
    );
  }

  const initial = email[0]?.toUpperCase() ?? '?';

  // Mobile: inline links inside the menu panel
  if (mobile) {
    return (
      <div className="border-t border-brand-border mt-1 pt-1">
        <p className="px-3 py-2 text-[11px] text-brand-text-muted truncate">{email}</p>
        <Link href="/my" className="block px-3 py-3 rounded-lg text-base font-medium text-brand-text-primary active:bg-brand-surface">
          My Index
        </Link>
        <button onClick={signOut} className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-brand-text-secondary active:bg-brand-surface">
          Sign out
        </button>
      </div>
    );
  }

  // Desktop: avatar + dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-7 h-7 rounded-full bg-brand-gold text-black text-xs font-semibold flex items-center justify-center hover:bg-brand-gold-dim transition-colors"
      >
        {initial}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 z-50 bg-brand-surface border border-brand-border rounded-xl shadow-xl py-1.5">
            <p className="px-3 py-2 text-[11px] text-brand-text-muted truncate border-b border-brand-border">{email}</p>
            <Link href="/my" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-brand-text-primary hover:bg-brand-card">
              My Index
            </Link>
            <button onClick={signOut} className="block w-full text-left px-3 py-2.5 text-sm text-brand-text-secondary hover:bg-brand-card">
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';
import { clearLocalProfile } from '@/lib/profile/sync';

export default function AccountSettings() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setEmail(data.user?.email ?? null);
        setReady(true);
      });
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign('/');
  }

  async function deleteAccount() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not delete your account.');
      }
      clearLocalProfile();
      try {
        await createClient().auth.signOut();
      } catch {
        /* session already gone server-side */
      }
      window.location.assign('/?deleted=1');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  if (!ready) return <div className="h-32" />;

  if (!supabaseConfigured || !email) {
    return (
      <p className="text-sm text-brand-text-secondary">
        You’re not signed in.{' '}
        <Link href="/signin" className="text-brand-gold hover:underline">Sign in</Link> to manage your account.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">Signed in as</p>
        <p className="text-base text-brand-text-primary">{email}</p>
        <button onClick={signOut} className="mt-3 text-sm text-brand-gold hover:underline">
          Sign out
        </button>
      </section>

      <section className="border border-brand-red/30 rounded-xl p-5 bg-brand-red/5">
        <h2 className="text-base font-medium text-brand-text-primary mb-1">Delete account</h2>
        <p className="text-sm text-brand-text-secondary mb-4">
          Permanently deletes your account and everything tied to it — your ratings, watchlist, and blind-test
          history. This can’t be undone.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-sm text-brand-red border border-brand-red/40 rounded-lg px-4 py-2 hover:bg-brand-red/10 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-brand-text-primary">Are you sure? This is permanent.</p>
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={busy}
                className="text-sm text-white bg-brand-red rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {busy ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={busy}
                className="text-sm text-brand-text-secondary border border-brand-border rounded-lg px-4 py-2 hover:text-brand-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-xs text-brand-red">{error}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

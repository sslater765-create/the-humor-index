'use client';
import { useState } from 'react';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  if (!supabaseConfigured) {
    return (
      <p className="text-center text-sm text-brand-text-muted">
        Accounts aren’t switched on yet. Check back soon.
      </p>
    );
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
    }
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (status === 'sent') {
    return (
      <div className="text-center">
        <p className="font-serif italic text-xl text-brand-gold mb-2">Check your email.</p>
        <p className="text-sm text-brand-text-secondary">
          We sent a sign-in link to <span className="text-brand-text-primary">{email}</span>. Click it
          to finish — you can close this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-2.5 bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text-primary hover:border-brand-gold transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-brand-border" />
        <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">or</span>
        <span className="h-px flex-1 bg-brand-border" />
      </div>

      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-brand-gold text-black text-sm font-medium px-4 py-3 rounded-lg hover:bg-brand-gold-dim transition-colors disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-center text-xs text-brand-red">{message || 'Something went wrong. Try again.'}</p>
      )}

      <p className="text-center text-[11px] text-brand-text-muted leading-relaxed">
        No passwords. Signing in lets your taste profile, ratings, and streak follow you across devices.
      </p>
    </div>
  );
}

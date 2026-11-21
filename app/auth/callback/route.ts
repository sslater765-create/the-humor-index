import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// Only same-site paths: '/movies/elf/' yes, '//evil.com' or 'https://...' no.
function safePath(p: string | null | undefined): string | null {
  if (!p) return null;
  try {
    const d = decodeURIComponent(p);
    return d.startsWith('/') && !d.startsWith('//') && !d.includes('\\') ? d : null;
  } catch {
    return null;
  }
}

// Handles the redirect from magic-link emails and OAuth providers.
// Where to land afterwards: ?next=, else the hi_next cookie the Log button sets
// before sending someone to sign in, else /my.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = cookies();
  const next = safePath(searchParams.get('next')) ?? safePath(cookieStore.get('hi_next')?.value) ?? '/my';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const res = NextResponse.redirect(`${origin}${next}`);
      res.cookies.set('hi_next', '', { path: '/', maxAge: 0 });
      return res;
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`);
}

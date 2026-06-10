import { createBrowserClient } from '@supabase/ssr';

/** True only when the Supabase env vars are present (set in Vercel + .env.local). */
export const supabaseConfigured: boolean =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Browser-side Supabase client. Only call when supabaseConfigured is true. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

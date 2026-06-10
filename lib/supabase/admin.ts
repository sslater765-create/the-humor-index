import { createClient as createAdminClient } from '@supabase/supabase-js';

/** True when the server has a service-role key (required for account deletion). */
export const adminConfigured: boolean =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Privileged server-only Supabase client. NEVER import this into a client
 * component — the service-role key bypasses Row-Level Security.
 */
export function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin, adminConfigured } from '@/lib/supabase/admin';

// Permanently deletes the signed-in user's account. Removing the auth user
// cascades to profiles/ratings/watchlist via ON DELETE CASCADE in the schema.
export async function POST() {
  if (!adminConfigured) {
    return NextResponse.json({ error: 'Account deletion is not configured.' }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const admin = createAdmin();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clear the now-orphaned session cookie.
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}

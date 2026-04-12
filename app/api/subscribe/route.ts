import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Beehiiv API integration
  // Set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in your Vercel env vars
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    // Fallback: just log the email (no Beehiiv configured yet)
    console.log(`[Newsletter signup] ${email}`);
    return NextResponse.json({ success: true, message: 'Subscribed (local mode)' });
  }

  try {
    const resp = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'website',
          utm_medium: 'footer_signup',
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error(`Beehiiv error: ${err}`);
      return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Newsletter error:', e);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}

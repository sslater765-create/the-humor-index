import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const VOTES_KEY = 'show_votes';
const VOTERS_KEY = 'show_voters';
const CUSTOM_KEY = 'custom_suggestions';

async function getRedis() {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  await client.connect();
  return client;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('admin');
  let client;

  try {
    client = await getRedis();
    const votes = (await client.hGetAll(VOTES_KEY)) || {};

    if (secret === process.env.ADMIN_SECRET) {
      const voters = (await client.hGetAll(VOTERS_KEY)) || {};
      const customs = (await client.lRange(CUSTOM_KEY, 0, -1)) || [];
      await client.quit();
      return NextResponse.json({ votes, voters, custom_suggestions: customs });
    }

    await client.quit();
    return NextResponse.json({ votes });
  } catch (e) {
    console.error('Redis read error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ votes: {} });
  }
}

const RATE_LIMIT_PREFIX = 'vote_rate:';
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 10; // max votes per window per IP

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(req: NextRequest) {
  let client;

  try {
    client = await getRedis();

    // Rate limiting by IP
    const ip = getClientIP(req);
    const rateKey = `${RATE_LIMIT_PREFIX}${ip}`;
    const currentCount = await client.incr(rateKey);
    if (currentCount === 1) {
      await client.expire(rateKey, RATE_LIMIT_WINDOW);
    }
    if (currentCount > RATE_LIMIT_MAX) {
      await client.quit();
      return NextResponse.json({ error: 'Too many votes. Try again in a minute.' }, { status: 429 });
    }

    const { slug, email, customShow, unvote } = await req.json();

    if (customShow) {
      const entry = JSON.stringify({ show: customShow, email: email || null, timestamp: new Date().toISOString() });
      await client.lPush(CUSTOM_KEY, entry);
      await client.quit();
      return NextResponse.json({ success: true });
    }

    if (!slug) {
      await client.quit();
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }

    const newCount = await client.hIncrBy(VOTES_KEY, slug, unvote ? -1 : 1);

    if (email && !unvote) {
      const existing = await client.hGet(VOTERS_KEY, slug);
      const voters = existing ? JSON.parse(existing) : [];
      voters.push({ email, timestamp: new Date().toISOString() });
      await client.hSet(VOTERS_KEY, slug, JSON.stringify(voters));
    }

    await client.quit();
    return NextResponse.json({ success: true, slug, count: newCount });
  } catch (e) {
    console.error('Redis write error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Global tally for the "Do you agree with the Index?" game. Each call records
// whether a human picked the same joke the Humor Index scored higher. Over time
// this becomes a real, citable validation stat: "humans agree with the Index N%
// of the time." Fail-safe: if Redis isn't configured, reads return nulls and
// writes no-op, exactly like /api/vote.

const KEY = 'agree_tally';            // hash: { agree, total }
const RATE_PREFIX = 'agree_rate:';
const RATE_WINDOW = 60;               // seconds
const RATE_MAX = 60;                  // calls per window per IP

async function getRedis() {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  await client.connect();
  return client;
}

function clientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') || 'unknown';
}

export async function GET() {
  let client;
  try {
    client = await getRedis();
    const t = (await client.hGetAll(KEY)) || {};
    await client.quit();
    const agree = Number(t.agree || 0);
    const total = Number(t.total || 0);
    return NextResponse.json({ agree, total, pct: total ? Math.round((agree / total) * 100) : null });
  } catch (e) {
    console.error('agree GET error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ agree: 0, total: 0, pct: null });
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    client = await getRedis();

    const ip = clientIP(req);
    const rateKey = `${RATE_PREFIX}${ip}`;
    const n = await client.incr(rateKey);
    if (n === 1) await client.expire(rateKey, RATE_WINDOW);
    if (n > RATE_MAX) {
      await client.quit();
      return NextResponse.json({ error: 'Slow down a moment.' }, { status: 429 });
    }

    const { agree } = await req.json();
    await client.hIncrBy(KEY, 'total', 1);
    if (agree === true) await client.hIncrBy(KEY, 'agree', 1);
    const t = (await client.hGetAll(KEY)) || {};
    await client.quit();
    const a = Number(t.agree || 0);
    const tot = Number(t.total || 0);
    return NextResponse.json({ agree: a, total: tot, pct: tot ? Math.round((a / tot) * 100) : null });
  } catch (e) {
    console.error('agree POST error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ ok: false });
  }
}

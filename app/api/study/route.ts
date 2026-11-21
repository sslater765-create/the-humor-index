import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// The human rating study. Readers rate jokes 1 to 10 without seeing any score;
// we keep a sum and a count per joke, and the study page correlates the human
// means with the model's scores. Fail-safe like /api/agree: without Redis,
// reads return nothing and writes no-op.

const SUM = 'study_v1:sum';   // hash joke id -> sum of ratings
const CNT = 'study_v1:n';     // hash joke id -> number of ratings
const RATERS = 'study_v1:raters'; // HyperLogLog of rater ids
const RATE_PREFIX = 'study_rate:';
const RATE_WINDOW = 60;
const RATE_MAX = 40;

async function getRedis() {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  await client.connect();
  return client;
}

function clientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function GET() {
  let client;
  try {
    client = await getRedis();
    const [sum, n, raters] = await Promise.all([client.hGetAll(SUM), client.hGetAll(CNT), client.pfCount(RATERS)]);
    await client.quit();
    const out: Record<string, [number, number]> = {};
    for (const [id, c] of Object.entries(n || {})) out[id] = [Number(sum?.[id] || 0), Number(c || 0)];
    return NextResponse.json({ jokes: out, raters }, { headers: { 'Cache-Control': 's-maxage=60' } });
  } catch (e) {
    console.error('study GET error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ jokes: {}, raters: 0 });
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    const { id, rating, rater } = await req.json();
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 10 || !/^\d{1,9}$/.test(String(id))) {
      return NextResponse.json({ error: 'bad rating' }, { status: 400 });
    }
    client = await getRedis();
    const rateKey = `${RATE_PREFIX}${clientIP(req)}`;
    const k = await client.incr(rateKey);
    if (k === 1) await client.expire(rateKey, RATE_WINDOW);
    if (k > RATE_MAX) {
      await client.quit();
      return NextResponse.json({ error: 'Slow down a moment.' }, { status: 429 });
    }
    await client.hIncrBy(SUM, String(id), r);
    await client.hIncrBy(CNT, String(id), 1);
    if (typeof rater === 'string' && /^[a-z0-9-]{8,40}$/i.test(rater)) await client.pfAdd(RATERS, rater);
    await client.quit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('study POST error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ ok: false });
  }
}

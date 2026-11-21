import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Running-gag bracket votes. Each pick is stored against its matchup
// ("a|b", ids sorted) so the page can show how the crowd split, plus a tally
// of champions. Fail-safe like /api/agree.

const PAIRS = 'bracket_v1:pairs';       // hash "a|b|winner" -> count
const CHAMPS = 'bracket_v1:champs';     // hash gag id -> count
const RATE_PREFIX = 'bracket_rate:';
const ID = /^[a-z0-9-]{2,60}:\d{1,3}$/;

async function getRedis() {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  await client.connect();
  return client;
}

export async function GET() {
  let client;
  try {
    client = await getRedis();
    const [pairs, champs] = await Promise.all([client.hGetAll(PAIRS), client.hGetAll(CHAMPS)]);
    await client.quit();
    return NextResponse.json({ pairs: pairs || {}, champs: champs || {} }, { headers: { 'Cache-Control': 's-maxage=30' } });
  } catch (e) {
    console.error('bracket GET error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ pairs: {}, champs: {} });
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    const body = await req.json();
    const { a, b, winner, champion } = body as { a?: string; b?: string; winner?: string; champion?: string };
    client = await getRedis();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const k = await client.incr(`${RATE_PREFIX}${ip}`);
    if (k === 1) await client.expire(`${RATE_PREFIX}${ip}`, 60);
    if (k > 60) { await client.quit(); return NextResponse.json({ error: 'Slow down a moment.' }, { status: 429 }); }
    if (a && b && winner && ID.test(a) && ID.test(b) && (winner === a || winner === b)) {
      const [x, y] = [a, b].sort();
      await client.hIncrBy(PAIRS, `${x}|${y}|${winner}`, 1);
    }
    if (champion && ID.test(champion)) await client.hIncrBy(CHAMPS, champion, 1);
    await client.quit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('bracket POST error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ ok: false });
  }
}

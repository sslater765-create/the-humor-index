import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';
import { BRACKET_ID, openRound } from '@/lib/bracket';

// Running-gag bracket votes, one tournament round a week. Each vote is stored
// against its round and matchup ("r|a|b|winner", ids sorted) and only the open
// round takes votes. v2 key: the v1 tallies were test votes from before the
// tournament format. Fail-safe like /api/agree.

const VOTES = 'bracket_v2:votes'; // hash "r|a|b|winner" -> count
const RATE_PREFIX = 'bracket_rate:';

async function getRedis() {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  await client.connect();
  return client;
}

export async function GET() {
  let client;
  try {
    client = await getRedis();
    const votes = await client.hGetAll(VOTES);
    await client.quit();
    return NextResponse.json({ votes: votes || {}, open: openRound() }, { headers: { 'Cache-Control': 's-maxage=30' } });
  } catch (e) {
    console.error('bracket GET error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ votes: {}, open: openRound() });
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    const { round, a, b, winner } = (await req.json()) as { round?: number; a?: string; b?: string; winner?: string };
    if (round !== openRound()) return NextResponse.json({ error: 'That round is closed.' }, { status: 409 });
    if (!a || !b || !winner || !BRACKET_ID.test(a) || !BRACKET_ID.test(b) || a === b || (winner !== a && winner !== b)) {
      return NextResponse.json({ error: 'bad vote' }, { status: 400 });
    }
    client = await getRedis();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const k = await client.incr(`${RATE_PREFIX}${ip}`);
    if (k === 1) await client.expire(`${RATE_PREFIX}${ip}`, 60);
    if (k > 30) { await client.quit(); return NextResponse.json({ error: 'Slow down a moment.' }, { status: 429 }); }
    const [x, y] = [a, b].sort();
    await client.hIncrBy(VOTES, `${round}|${x}|${y}|${winner}`, 1);
    await client.quit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('bracket POST error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ ok: false });
  }
}

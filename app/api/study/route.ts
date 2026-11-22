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

// Panel mode (/study?panel=<id>): paid raters, e.g. from Prolific. Their
// ratings go to separate keys, one hash per rater, so the panel can be
// analyzed on its own and never mixes with the public tally. A panel id must
// be listed in STUDY_PANELS (comma-separated) to be accepted. A rater who has
// rated PANEL_TARGET jokes gets the completion code from STUDY_PANEL_CODE.
const PANEL_TARGET = 40;
const PANEL = (p: string) => `study_panel_v1:${p}`;
const okPanel = (p: unknown): p is string =>
  typeof p === 'string' && /^[a-z0-9-]{2,24}$/.test(p) && (process.env.STUDY_PANELS || '').split(',').map(x => x.trim()).includes(p);
const okPid = (p: unknown): p is string => typeof p === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(p);

async function getRedis() {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  await client.connect();
  return client;
}

function clientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const panel = q.get('panel');
  if (panel !== null) return panelGet(panel, q.get('pid'), q.get('export'));
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

async function panelGet(panel: string, pid: string | null, exportKey: string | null) {
  if (!okPanel(panel)) return NextResponse.json({ error: 'unknown panel' }, { status: 404 });
  let client;
  try {
    client = await getRedis();
    // Full export of every rater's ratings, for analysis. Needs STUDY_EXPORT_KEY.
    if (exportKey !== null) {
      if (!process.env.STUDY_EXPORT_KEY || exportKey !== process.env.STUDY_EXPORT_KEY) {
        await client.quit();
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }
      const raters: Record<string, Record<string, string>> = {};
      for await (const key of client.scanIterator({ MATCH: `${PANEL(panel)}:r:*`, COUNT: 200 })) {
        const keys = Array.isArray(key) ? key : [key];
        for (const k of keys) raters[k.slice(`${PANEL(panel)}:r:`.length)] = await client.hGetAll(k);
      }
      await client.quit();
      return NextResponse.json({ panel, raters }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const [sum, n] = await Promise.all([client.hGetAll(`${PANEL(panel)}:sum`), client.hGetAll(`${PANEL(panel)}:n`)]);
    const count = okPid(pid) ? await client.hLen(`${PANEL(panel)}:r:${pid}`) : 0;
    await client.quit();
    const jokes: Record<string, [number, number]> = {};
    for (const [id, c] of Object.entries(n || {})) jokes[id] = [Number(sum?.[id] || 0), Number(c || 0)];
    const code = count >= PANEL_TARGET ? process.env.STUDY_PANEL_CODE || null : null;
    return NextResponse.json({ jokes, raters: 0, count, target: PANEL_TARGET, code }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('study panel GET error:', e);
    if (client) try { await client.quit(); } catch {}
    return NextResponse.json({ jokes: {}, raters: 0, count: 0, target: PANEL_TARGET, code: null });
  }
}

export async function POST(req: NextRequest) {
  let client;
  try {
    const { id, rating, rater, panel, pid } = await req.json();
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
    if (panel !== undefined) {
      if (!okPanel(panel) || !okPid(pid)) {
        await client.quit();
        return NextResponse.json({ error: 'bad panel' }, { status: 400 });
      }
      // One rating per rater per joke; a repeat is ignored.
      const fresh = await client.hSetNX(`${PANEL(panel)}:r:${pid}`, String(id), String(r));
      if (fresh) {
        await client.hIncrBy(`${PANEL(panel)}:sum`, String(id), r);
        await client.hIncrBy(`${PANEL(panel)}:n`, String(id), 1);
      }
      await client.quit();
      return NextResponse.json({ ok: true });
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

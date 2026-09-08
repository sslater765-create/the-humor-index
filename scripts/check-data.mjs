#!/usr/bin/env node
/**
 * Data integrity checks for public/data.
 *
 * Written after the Sep 2026 repair, where a scoring pass left Dinner Party
 * split across two records (right metadata + wrong transcript in one, wrong
 * metadata + right transcript in the other) and nothing caught it. Run this
 * after every scoring or import pass.
 *
 *   node scripts/check-data.mjs            # errors fail the run
 *   node scripts/check-data.mjs --strict   # warnings fail too
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join(process.cwd(), 'public', 'data');
const EP_FILE = /^s(\d{2})e(\d{2})\.json$/;
const DUPE_THRESHOLD = 0.4;   // share of the smaller episode's jokes
const MIN_JOKE_LEN = 15;      // ignore very short lines when fingerprinting

const errors = [];
const warnings = [];
const known = [];

// Pairs already known to be broken. Reported, but they do not fail the run, so
// this check stays useful for catching NEW breakage. Clear entries as they are fixed.
const KNOWN_PATH = path.join(process.cwd(), 'scripts', 'known-data-issues.json');
const KNOWN_SHARED = new Set(
  fs.existsSync(KNOWN_PATH) ? (JSON.parse(fs.readFileSync(KNOWN_PATH, 'utf-8')).shared_transcripts ?? []) : []
);
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const norm = (t) => String(t ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
// Two-parters legitimately share material; strip the part marker and compare stems.
const stem = (t) => norm(String(t ?? '').replace(/\s*[:,]?\s*\(?\s*(part\s*)?(1|2|one|two|i|ii)\s*\)?\s*$/i, ''));

const shows = readJson(path.join(DATA, 'shows.json'));
const scored = shows.filter((s) => (s.humor_index ?? 0) > 0);
let episodeCount = 0;

for (const show of shows) {
  const dir = path.join(DATA, show.slug);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter((f) => EP_FILE.test(f));
  const details = new Map();
  for (const f of files) {
    let d;
    try {
      d = readJson(path.join(dir, f));
    } catch (e) {
      err(`${show.slug}/${f}: unparseable JSON (${e.message})`);
      continue;
    }
    const [, ss, ee] = f.match(EP_FILE);
    if (d.season !== Number(ss) || d.episode_number !== Number(ee)) {
      err(`${show.slug}/${f}: filename says S${ss}E${ee} but the record says S${String(d.season).padStart(2, '0')}E${String(d.episode_number).padStart(2, '0')}`);
    }
    for (const [k, t] of Object.entries({ show: 'string', slug: 'string', season: 'number', episode_number: 'number', title: 'string', humor_index: 'number', total_jokes: 'number' })) {
      if (typeof d[k] !== t) err(`${show.slug}/${f}: ${k} should be ${t}, got ${typeof d[k]}`);
    }
    if (!Array.isArray(d.jokes)) { err(`${show.slug}/${f}: jokes is not an array`); continue; }
    if (d.total_jokes !== d.jokes.length) warn(`${show.slug}/${f}: total_jokes ${d.total_jokes} but ${d.jokes.length} jokes present`);

    const seen = new Set();
    for (const j of d.jokes) {
      if (typeof j.index !== 'number') { err(`${show.slug}/${f}: a joke has no numeric index`); break; }
      if (seen.has(j.index)) { err(`${show.slug}/${f}: duplicate joke index ${j.index}`); break; }
      seen.add(j.index);
    }

    // These two are JSON-encoded strings; single-character entries mean the
    // string got iterated instead of parsed somewhere upstream.
    const types = parseMaybeJson(d.dominant_joke_types);
    if (types.some((t) => String(t).length <= 2)) err(`${show.slug}/${f}: dominant_joke_types looks truncated: ${JSON.stringify(types)}`);
    const standout = parseMaybeJson(d.standout_joke_ids);
    const bad = standout.filter((id) => !seen.has(id));
    if (standout.length && bad.length) err(`${show.slug}/${f}: standout_joke_ids ${JSON.stringify(bad)} are not indices in this episode`);

    details.set(`${d.season}-${d.episode_number}`, d);
    episodeCount++;
  }

  // episodes.json must line up exactly with the episode files
  const epfPath = path.join(dir, 'episodes.json');
  if (fs.existsSync(epfPath)) {
    const rows = readJson(epfPath);
    const listed = new Set();
    for (const r of rows) {
      const key = `${r.season}-${r.episode_number}`;
      listed.add(key);
      const d = details.get(key);
      if (!d) { err(`${show.slug}: episodes.json lists S${r.season}E${r.episode_number} but the episode file is missing (route would 404)`); continue; }
      if (d.title !== r.title) err(`${show.slug} S${r.season}E${r.episode_number}: title differs between episodes.json (${JSON.stringify(r.title)}) and the episode file (${JSON.stringify(d.title)})`);
      if (d.humor_index !== r.humor_index) err(`${show.slug} S${r.season}E${r.episode_number}: humor_index differs between episodes.json (${r.humor_index}) and the episode file (${d.humor_index})`);
      if (r.dominant_joke_types === undefined) warn(`${show.slug} S${r.season}E${r.episode_number}: episodes.json has no dominant_joke_types, so the type chip will not render`);
    }
    for (const key of details.keys()) {
      if (!listed.has(key)) err(`${show.slug}: s${key} exists as a file but is not in episodes.json (orphan)`);
    }
    // duplicate titles inside a season usually mean one record is mislabelled
    const byTitle = new Map();
    for (const r of rows) {
      const k = `${r.season}|${r.title}`;
      byTitle.set(k, (byTitle.get(k) ?? 0) + 1);
    }
    for (const [k, n] of byTitle) if (n > 1) err(`${show.slug}: season ${k.split('|')[0]} has ${n} episodes titled ${JSON.stringify(k.split('|')[1])}`);

    // titles that still carry import damage
    for (const r of rows) {
      if (/&amp;|&#39;|&quot;|\bAmp\b/i.test(r.title)) err(`${show.slug} S${r.season}E${r.episode_number}: unescaped HTML entity in title ${JSON.stringify(r.title)}`);
      if (/^S\d{2}E\d{2}$/.test(r.title)) err(`${show.slug} S${r.season}E${r.episode_number}: placeholder title ${JSON.stringify(r.title)}`);
      if (/\b[A-Za-z]+ S\b/.test(r.title)) err(`${show.slug} S${r.season}E${r.episode_number}: orphaned possessive in title ${JSON.stringify(r.title)}`);
      if (/^"/.test(r.title)) err(`${show.slug} S${r.season}E${r.episode_number}: stray show-name prefix in title ${JSON.stringify(r.title)}`);
    }
  }

  // shared transcripts: the bug that produced the Sep 2026 repair
  const list = [...details.values()];
  for (let i = 0; i < list.length; i++) {
    for (let k = i + 1; k < list.length; k++) {
      const a = list[i], b = list[k];
      const sa = fingerprint(a), sb = fingerprint(b);
      if (!sa.size || !sb.size) continue;
      let shared = 0;
      for (const x of sa) if (sb.has(x)) shared++;
      const ratio = shared / Math.min(sa.size, sb.size);
      if (ratio < DUPE_THRESHOLD) continue;
      const twoParter = a.season === b.season && stem(a.title) === stem(b.title);
      const key = `${show.slug} S${a.season}E${a.episode_number}|S${b.season}E${b.episode_number}`;
      const msg = `${show.slug}: S${a.season}E${a.episode_number} ${JSON.stringify(a.title)} and S${b.season}E${b.episode_number} ${JSON.stringify(b.title)} share ${(ratio * 100).toFixed(0)}% of their jokes`;
      if (KNOWN_SHARED.has(key)) known.push(`${msg} (known, awaiting rescore)`);
      else if (twoParter) warn(`${msg} (looks like a two-parter, probably fine)`);
      else err(`${msg} — one of them is carrying the other's transcript`);
    }
  }
}

// top-jokes.json must resolve to real episodes with matching titles
const tjPath = path.join(DATA, 'top-jokes.json');
if (fs.existsSync(tjPath)) {
  for (const t of readJson(tjPath)) {
    const p = path.join(DATA, t.show_slug, `s${String(t.season).padStart(2, '0')}e${String(t.episode_number).padStart(2, '0')}.json`);
    if (!fs.existsSync(p)) { err(`top-jokes.json points at a missing episode: ${t.show_slug} S${t.season}E${t.episode_number}`); continue; }
    const d = readJson(p);
    if (d.title !== t.episode_title) err(`top-jokes.json episode_title ${JSON.stringify(t.episode_title)} does not match the episode file ${JSON.stringify(d.title)}`);
  }
  const slugs = new Set(readJson(tjPath).map((t) => t.show_slug));
  for (const s of scored) if (!slugs.has(s.slug)) warn(`top-jokes.json has no entry for scored show ${s.slug}`);
}

function parseMaybeJson(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}

function fingerprint(d) {
  const out = new Set();
  for (const j of d.jokes ?? []) {
    const n = norm(j.text);
    if (n.length > MIN_JOKE_LEN) out.add(n.slice(0, 40));
  }
  return out;
}

const strict = process.argv.includes('--strict');
console.log(`checked ${episodeCount} episode files across ${scored.length} scored shows`);
if (known.length) {
  console.log(`\n${known.length} known issue(s) from scripts/known-data-issues.json, not failing the run:`);
  for (const k of known) console.log(`  - ${k}`);
}
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 40)) console.log(`  ! ${w}`);
  if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more`);
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors.slice(0, 40)) console.error(`  x ${e}`);
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
if (strict && warnings.length) { console.error('\n--strict: warnings are errors'); process.exit(1); }
console.log(errors.length || warnings.length ? '' : '\nno problems found');

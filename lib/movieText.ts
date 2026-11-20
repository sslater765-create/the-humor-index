import type { MovieJoke } from './movies';

export type Line = { speaker?: string; line: string; note?: boolean };

const QUOTED = /^['"‘“](.+?)['"’”][.!?]?$/;

/**
 * The scorer logs a joke as free text: sometimes one bare line, sometimes
 * "Ron: 'x' / Brick: 'y'", sometimes a description with the quote inside.
 * Turn that into speaker-attributed lines for display. Anything that does not
 * parse cleanly is shown as written rather than guessed at.
 */
export function jokeLines(text: string, characters: string[]): Line[] {
  const full = (name: string) => {
    const n = name.trim().toLowerCase();
    return characters.find(c => {
      const cl = c.toLowerCase();
      return cl === n || cl.split(' ').includes(n.split(' ')[0]);
    }) ?? name.trim();
  };
  // Split on " / " and " — ", and also where a second "Name: '...'" starts
  // straight after a closing quote ("Mantooth threatens: 'x' Ron: 'y'").
  const parts = text
    .split(/\s+\/\s+|\s+—\s+|(?<=['’”][.!?]?)\s+(?=[A-Z][\w.'-]*(?: [A-Z][\w.'-]*)?(?: [a-z]+)?:\s*['‘“])/)
    .map(p => p.trim())
    .filter(Boolean);
  const out: Line[] = [];
  for (const p of parts) {
    const named = p.match(/^([A-Z][\w.'-]*(?: [A-Z][\w.'-]*){0,2})(?: [a-z]+){0,2}:\s*(.+)$/);
    if (named) {
      const body = named[2].trim();
      const q = body.match(QUOTED);
      out.push({ speaker: full(named[1]), line: q ? q[1] : body });
      continue;
    }
    const q = p.match(QUOTED);
    if (q) {
      out.push({ speaker: characters.length === 1 ? characters[0] : undefined, line: q[1] });
      continue;
    }
    // A description that carries a quote inside it reads as a stage note.
    if (/['‘“].{4,}['’”]/.test(p) && /^[A-Z][a-z]+(?:'s)? [a-z]/.test(p)) {
      out.push({ line: p, note: true });
      continue;
    }
    // A bare fragment after a stage note is the rest of that note.
    const prev = out[out.length - 1];
    if (prev?.note) { prev.line = `${prev.line}, ${p}`; continue; }
    out.push({ speaker: characters.length === 1 && out.length === 0 ? characters[0] : undefined, line: p });
  }
  // A single unattributed line from a multi-character joke: credit the first.
  if (out.length === 1 && !out[0].speaker && !out[0].note && characters.length) out[0].speaker = characters[0];
  return out;
}

/** The single quotable line of a joke, for titles, descriptions and share cards. */
export function bestLine(j: MovieJoke): string {
  const lines = jokeLines(j.text, j.characters).filter(l => !l.note);
  const pick = lines.sort((a, b) => b.line.length - a.line.length)[0];
  if (pick) return pick.line.replace(/\s+/g, ' ').trim();
  // Only a stage note: quote the line it describes.
  const inner = j.text.match(/['\u2018\u201C]([^'\u2019\u201D]{6,})['\u2019\u201D]/);
  return (inner ? inner[1] : j.text).replace(/\s+/g, ' ').trim();
}


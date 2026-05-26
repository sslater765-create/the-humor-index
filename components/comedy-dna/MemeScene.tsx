import { useId } from 'react';
import type { ReactNode } from 'react';

/**
 * MemeScene — illustrated, face-free scene backdrops for Comedy DNA battle cards.
 *
 * Each `scene` is a reusable setting (not a per-joke drawing), told through
 * iconic props + a spotlight, in a flat screen-print style. The dominant tint
 * is driven by the show's brand color so a card instantly reads as "from show X".
 *
 * Per-joke specificity is layered via `props` — up to two small decals
 * (soup-bowl, chess-set, ring, microphone, etc.) overlaid at scene-specific
 * slot positions. Prop names MUST stay in sync with PROP_KW in
 * build_comedy_dna_data.py (pipeline).
 */

const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const to = (v: number) => clamp(v * f).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}
function relLum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const a = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
const inkFor = (hex: string) => (relLum(hex) > 0.45 ? '#16130f' : '#ffffff');

// ---- per-scene prop placement slots (x, y in 320x150 viewBox) ----
const PROP_SLOTS: Record<string, [{ x: number; y: number }, { x: number; y: number }]> = {
  office:    [{ x: 88,  y: 88 },  { x: 226, y: 86 }],
  diner:     [{ x: 96,  y: 86 },  { x: 226, y: 88 }],
  livingroom:[{ x: 92,  y: 86 },  { x: 240, y: 86 }],
  courtroom: [{ x: 92,  y: 104 }, { x: 256, y: 104 }],
  stage:     [{ x: 96,  y: 108 }, { x: 246, y: 108 }],
  nursery:   [{ x: 90,  y: 108 }, { x: 256, y: 108 }],
  bar:       [{ x: 96,  y: 92 },  { x: 220, y: 90 }],
  outdoors:  [{ x: 96,  y: 124 }, { x: 232, y: 122 }],
  default:   [{ x: 88,  y: 118 }, { x: 232, y: 118 }],
};

// ---- bespoke per-joke scenes (the iconic ones whose ART IS THE JOKE) ----
// When the joke's id matches, this overrides the scene template + props entirely.
// Add new bespoke scenes by joke id; keep the visual centered on the gag itself.
function bespokeSVG(jokeId: number, color: string, mid: string, dark: string): ReactNode {
  switch (jokeId) {
    // Seinfeld — Soup Nazi: "No soup for you! Come back, one year."
    case 18628: return (<>
      <rect x="0" y="110" width="320" height="40" fill={dark} />
      <rect x="0" y="106" width="320" height="6" fill={mid} />
      <ellipse cx="160" cy="118" rx="78" ry="10" fill="#000" opacity="0.4" />
      <rect x="92" y="62" width="136" height="56" rx="8" fill="#2a1808" />
      <rect x="92" y="62" width="136" height="56" rx="8" fill="none" stroke="#5a3a18" strokeWidth="2" />
      <ellipse cx="160" cy="62" rx="68" ry="14" fill="#a85a22" />
      <ellipse cx="160" cy="60" rx="64" ry="11" fill="#caa030" />
      <ellipse cx="146" cy="58" rx="22" ry="4" fill="#e8c98a" opacity="0.65" />
      <path d="M130 46 q-6 -10 0 -22 q6 -10 0 -22" stroke="#e7c8a8" strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M160 42 q-6 -12 0 -24 q6 -12 0 -24" stroke="#e7c8a8" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M188 46 q-6 -10 0 -22 q6 -10 0 -22" stroke="#e7c8a8" strokeWidth="2.5" fill="none" opacity="0.55" />
      <g transform="translate(214 80) rotate(20)"><rect x="0" y="-2" width="4" height="46" fill="#cfcfcf" /><ellipse cx="2" cy="42" rx="10" ry="3" fill="#9aa0aa" /></g>
      <g transform="translate(258 24)">
        <rect x="-36" y="-14" width="72" height="34" rx="4" fill="#fff" />
        <rect x="-36" y="-14" width="72" height="34" rx="4" fill="none" stroke="#1c1008" strokeWidth="2" />
        <text x="0" y="2" textAnchor="middle" fontFamily="Arial Black,Arial" fontSize="13" fontWeight="900" fill="#1c1008" letterSpacing="1">SOUP</text>
        <line x1="-32" y1="-12" x2="32" y2="18" stroke="#e24b4a" strokeWidth="5" />
        <line x1="-32" y1="18" x2="32" y2="-12" stroke="#e24b4a" strokeWidth="5" />
      </g>
      <g>
        <path d="M-10 92 q44 -8 64 -10" stroke="#1c1008" strokeWidth="22" fill="none" strokeLinecap="round" />
        <path d="M-10 92 q44 -8 64 -10" stroke="#e6b48c" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx="58" cy="82" rx="10" ry="9" fill="#e6b48c" stroke="#1c1008" strokeWidth="1.5" />
        <rect x="64" y="78" width="20" height="7" rx="3" fill="#e6b48c" stroke="#1c1008" strokeWidth="1.5" />
      </g>
      <g transform="translate(252 116)">
        <ellipse cx="0" cy="3" rx="16" ry="3" fill="#000" opacity="0.3" />
        <path d="M-16 -2 q16 -9 32 0 q-3 9 -16 11 q-13 -2 -16 -11z" fill="#dcd3c1" stroke="#1c1008" strokeWidth="1.2" />
      </g>
    </>);
    // The Office — Pam at the Dundies: "I feel God in this Chili's tonight"
    case 595: return (<>
      <circle cx="44" cy="14" r="8" fill="#ffd76b" /><circle cx="44" cy="14" r="22" fill="#ffe9a8" opacity="0.18" />
      <circle cx="276" cy="14" r="8" fill="#ffd76b" /><circle cx="276" cy="14" r="22" fill="#ffe9a8" opacity="0.18" />
      <polygon points="160,8 220,150 100,150" fill="#ffe7ad" opacity="0.13" />
      <rect x="78" y="22" width="164" height="26" rx="5" fill="#143a5c" />
      <rect x="78" y="22" width="164" height="26" rx="5" fill="none" stroke="#2f6fb0" strokeWidth="2" />
      <text x="160" y="40" textAnchor="middle" fontFamily="Arial Black,Arial" fontSize="15" fontWeight="900" fill="#ffd76b" letterSpacing="3.5">DUNDIES</text>
      <rect x="0" y="62" width="320" height="18" fill="#9c3b30" opacity="0.45" />
      <rect x="0" y="62" width="320" height="3" fill="#b8483a" opacity="0.6" />
      <ellipse cx="160" cy="142" rx="138" ry="11" fill="#000" opacity="0.35" />
      <rect x="24" y="124" width="272" height="14" rx="4" fill="#1c3f60" />
      <rect x="24" y="120" width="272" height="6" fill="#2a5582" />
      <g>
        <path d="M148 124 q-4 -22 12 -26 q16 4 12 26z" fill="#1c2a3e" />
        <circle cx="160" cy="92" r="10" fill="#1c2a3e" />
        <path d="M168 96 q12 -6 14 -22" stroke="#1c2a3e" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(186 56)">
        <circle cx="0" cy="0" r="20" fill="#ffd76b" opacity="0.2" />
        <path d="M-18 -8 q18 -10 36 0 q-3 24 -18 30 q-15 -6 -18 -30z" fill="#ffd24a" />
        <path d="M-18 -8 q-13 0 -13 12 q0 10 13 12" fill="none" stroke="#ffd24a" strokeWidth="5" />
        <path d="M18 -8 q13 0 13 12 q0 10 -13 12" fill="none" stroke="#ffd24a" strokeWidth="5" />
        <rect x="-4" y="22" width="8" height="10" fill="#caa030" />
        <rect x="-14" y="32" width="28" height="6" rx="2" fill="#caa030" />
        <ellipse cx="-8" cy="-2" rx="9" ry="3" fill="#fff" opacity="0.7" />
        <path d="M22 -16 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#fff" />
        <path d="M-26 -10 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#fff" />
      </g>
      <g transform="translate(70 96)">
        <path d="M-18 0 L18 0 L4 26 L-4 26 Z" fill="#bfe6b0" />
        <path d="M-18 0 L18 0 L4 26 L-4 26 Z" fill="none" stroke="#9fce8e" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="19" ry="3.4" fill="#dff0d2" />
        <rect x="-1.5" y="26" width="3" height="16" fill="#cdd6c8" />
        <circle cx="14" cy="-3" r="4" fill="#8fbf66" />
      </g>
      <g>
        <rect x="50" y="56" width="5" height="5" fill="#e24b4a" transform="rotate(20 52 58)" />
        <rect x="260" y="48" width="5" height="5" fill="#7f77dd" transform="rotate(-15 262 50)" />
        <rect x="120" y="64" width="4" height="4" fill="#3fb6a8" transform="rotate(35 122 66)" />
        <circle cx="106" cy="48" r="2.5" fill="#ffd76b" />
        <circle cx="218" cy="72" r="2.5" fill="#ffd76b" />
        <circle cx="58" cy="80" r="2" fill="#e24b4a" />
      </g>
    </>);
    // Friends — Joey wearing all of Chandler's clothes
    case 20897: return (<>
      <rect x="220" y="6" width="92" height="72" rx="3" fill="#ffd0e4" opacity="0.18" />
      <g stroke="#ffd0e4" strokeWidth="2.5" opacity="0.3" fill="none">
        <rect x="220" y="6" width="92" height="72" rx="3" />
        <line x1="266" y1="6" x2="266" y2="78" />
        <line x1="220" y1="42" x2="312" y2="42" />
      </g>
      <rect x="14" y="98" width="292" height="46" rx="14" fill="#c96a28" />
      <rect x="6" y="74" width="38" height="60" rx="12" fill="#d9772e" />
      <rect x="278" y="74" width="38" height="60" rx="12" fill="#d9772e" />
      <rect x="58" y="82" width="92" height="30" rx="9" fill="#e08b46" />
      <rect x="170" y="82" width="92" height="30" rx="9" fill="#e08b46" />
      <g>
        <ellipse cx="160" cy="146" rx="98" ry="8" fill="#000" opacity="0.25" />
        <path d="M80 134 q-16 -110 80 -116 q96 6 80 116 z" fill="#1d2740" />
        <path d="M96 104 q64 28 128 0" stroke="#2c3a5c" strokeWidth="3" fill="none" />
        <path d="M88 72 q72 32 144 0" stroke="#2c3a5c" strokeWidth="3" fill="none" />
        <path d="M100 42 q60 26 120 0" stroke="#2c3a5c" strokeWidth="3" fill="none" />
        <path d="M84 52 q-36 -2 -54 22" stroke="#1d2740" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M236 52 q36 -2 54 22" stroke="#1d2740" strokeWidth="26" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="74" r="11" fill="#1d2740" />
        <circle cx="290" cy="74" r="11" fill="#1d2740" />
        <circle cx="160" cy="20" r="22" fill="#1d2740" />
        <path d="M80 134 q-16 -110 80 -116 q44 1 64 24" stroke="#ffd0e4" strokeWidth="3" opacity="0.5" fill="none" />
      </g>
      <path d="M194 12 q6 8 0 14 q-6 -6 0 -14z" fill="#bfe2f0" stroke="#7f9fc0" strokeWidth="1.2" />
      <path d="M126 18 q4 6 0 10 q-4 -4 0 -10z" fill="#bfe2f0" stroke="#7f9fc0" strokeWidth="1" />
    </>);
    // Arrested Development — Tobias: "I'm afraid I just blue myself"
    case 46254: return (<>
      <rect x="0" y="0" width="320" height="100" fill={mid} />
      <rect x="0" y="100" width="320" height="50" fill={dark} />
      <rect x="0" y="98" width="320" height="3" fill="#7a3520" />
      <g transform="translate(232 50)">
        <rect x="-22" y="-32" width="44" height="56" rx="3" fill="#1a0905" stroke="#7a3520" strokeWidth="3" />
        <rect x="-19" y="-29" width="38" height="50" rx="2" fill="#2a4a6a" opacity="0.4" />
        <circle cx="0" cy="-12" r="6" fill="#5aa0d6" />
        <path d="M-7 -6 q0 -2 7 -3 q7 1 7 3 q-1 18 -7 22 q-6 -4 -7 -22z" fill="#5aa0d6" />
      </g>
      <g>
        <ellipse cx="140" cy="132" rx="40" ry="6" fill="#000" opacity="0.35" />
        <path d="M114 132 q-18 -64 26 -68 q44 4 26 68 z" fill="#5aa0d6" />
        <path d="M114 132 q-18 -64 26 -68 q12 1 18 8" stroke="#7fbbe0" strokeWidth="3" fill="none" opacity="0.7" />
        <circle cx="140" cy="56" r="20" fill="#5aa0d6" />
        <path d="M120 50 q20 -16 40 0 q-2 -10 -20 -10 q-18 0 -20 10z" fill="#3a82b8" />
        <path d="M114 72 q-8 22 -2 42" stroke="#5aa0d6" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M166 72 q8 22 2 42" stroke="#5aa0d6" strokeWidth="14" fill="none" strokeLinecap="round" />
        <ellipse cx="108" cy="114" rx="7" ry="6" fill="#5aa0d6" />
        <ellipse cx="172" cy="114" rx="7" ry="6" fill="#5aa0d6" />
        <circle cx="125" cy="90" r="2" fill="#3a6f9c" />
        <ellipse cx="155" cy="110" rx="2" ry="4" fill="#3a6f9c" />
        <circle cx="145" cy="78" r="1.5" fill="#3a6f9c" />
        <ellipse cx="135" cy="124" rx="1.5" ry="3" fill="#3a6f9c" />
      </g>
      <g transform="translate(58 122)">
        <ellipse cx="0" cy="9" rx="38" ry="5" fill="#5aa0d6" />
        <ellipse cx="-8" cy="9" rx="20" ry="3" fill="#7fbbe0" />
        <g transform="translate(-2 -6) rotate(-55)">
          <rect x="-18" y="-9" width="36" height="18" rx="2" fill="#9aa0aa" stroke="#1c1008" strokeWidth="1.5" />
          <rect x="-20" y="-11" width="40" height="4" rx="1" fill="#7a7a83" stroke="#1c1008" strokeWidth="1" />
          <path d="M-12 -11 q12 -8 24 0" fill="none" stroke="#1c1008" strokeWidth="2" />
          <rect x="-12" y="-4" width="24" height="8" fill="#5aa0d6" />
          <text x="0" y="2" textAnchor="middle" fontFamily="Arial Black,Arial" fontSize="6" fontWeight="900" fill="#fff">BLUE</text>
        </g>
      </g>
      <g>
        <circle cx="78" cy="48" r="4" fill="#5aa0d6" />
        <ellipse cx="86" cy="56" rx="2.5" ry="1.5" fill="#5aa0d6" />
        <circle cx="178" cy="34" r="3" fill="#5aa0d6" />
        <circle cx="190" cy="46" r="2" fill="#5aa0d6" />
      </g>
    </>);
    // Parks & Rec — Leslie: "You're all I need. I love you and I like you."
    case 39411: return (<>
      <ellipse cx="160" cy="-20" rx="200" ry="100" fill="#ffe7ad" opacity="0.12" />
      <rect x="0" y="128" width="320" height="22" fill={dark} />
      <rect x="120" y="128" width="80" height="22" fill="#a85a22" opacity="0.45" />
      <rect x="120" y="126" width="80" height="3" fill="#caa040" opacity="0.7" />
      <path d="M70 130 q0 -100 90 -100 q90 0 90 100" stroke="#caa040" strokeWidth="5" fill="none" />
      <g>
        <circle cx="78" cy="80" r="6" fill="#e2705a" /><circle cx="74" cy="84" r="2" fill="#a83b32" />
        <circle cx="86" cy="60" r="5" fill="#e2705a" />
        <circle cx="96" cy="44" r="6" fill="#d4537e" />
        <circle cx="112" cy="32" r="5" fill="#e2705a" />
        <circle cx="160" cy="22" r="6" fill="#d4537e" />
        <circle cx="150" cy="24" r="5" fill="#e2705a" />
        <circle cx="170" cy="24" r="5" fill="#e2705a" />
        <circle cx="208" cy="32" r="5" fill="#e2705a" />
        <circle cx="224" cy="44" r="6" fill="#d4537e" />
        <circle cx="234" cy="60" r="5" fill="#e2705a" />
        <circle cx="242" cy="80" r="6" fill="#e2705a" />
        <g fill="#4e8c5a">
          <ellipse cx="82" cy="76" rx="4" ry="2.5" />
          <ellipse cx="92" cy="50" rx="3" ry="2" />
          <ellipse cx="160" cy="18" rx="3.5" ry="2" />
          <ellipse cx="228" cy="50" rx="3" ry="2" />
          <ellipse cx="238" cy="76" rx="4" ry="2.5" />
        </g>
      </g>
      <g>
        <ellipse cx="125" cy="134" rx="22" ry="4" fill="#000" opacity="0.3" />
        <path d="M104 132 q0 -38 21 -42 q21 4 21 42 z" fill="#1c3f3a" />
        <path d="M104 132 q0 -38 21 -42 q9 2 14 8" stroke="#3fb6a8" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="125" cy="80" r="13" fill="#1c3f3a" />
        <path d="M113 76 q12 -14 24 0 q-1 22 -12 26 q-11 -4 -12 -26z" fill="#0c2521" />
        <path d="M137 80 q12 6 18 22 q-8 -4 -14 -6" fill="#fff" opacity="0.35" />
        <ellipse cx="195" cy="134" rx="22" ry="4" fill="#000" opacity="0.3" />
        <path d="M174 132 q0 -42 21 -46 q21 4 21 46 z" fill="#14141a" />
        <path d="M188 95 l7 10 7 -10 z" fill="#e9e2cf" />
        <path d="M195 100 l-3 22 3 6 3 -6z" fill="#3fb6a8" />
        <circle cx="195" cy="82" r="13" fill="#14141a" />
      </g>
      <g>
        <g transform="translate(160 70) scale(0.7)"><path d="M0 12 q-15 -10 -15 -22 q0 -8 8 -8 q4 0 7 6 q3 -6 7 -6 q8 0 8 8 q0 12 -15 22z" fill="#e24b4a" /></g>
        <g transform="translate(146 92) scale(0.4)"><path d="M0 12 q-15 -10 -15 -22 q0 -8 8 -8 q4 0 7 6 q3 -6 7 -6 q8 0 8 8 q0 12 -15 22z" fill="#e24b4a" opacity="0.7" /></g>
        <g transform="translate(176 96) scale(0.45)"><path d="M0 12 q-15 -10 -15 -22 q0 -8 8 -8 q4 0 7 6 q3 -6 7 -6 q8 0 8 8 q0 12 -15 22z" fill="#e24b4a" opacity="0.75" /></g>
      </g>
      <g fill="#ffd76b">
        <path d="M40 60 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        <path d="M280 70 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" />
        <path d="M280 110 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" />
        <path d="M40 110 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" />
      </g>
    </>);
    default: return null;
  }
}

// ---- prop SVGs (centered at origin; ~40-50px footprint) ----
function propSVG(name: string): ReactNode {
  switch (name) {
    case 'soup-bowl': return (<g>
      <ellipse cx="0" cy="10" rx="22" ry="5" fill="#000" opacity="0.32" />
      <path d="M-22 0 q22 -12 44 0 q-4 14 -22 16 q-18 -2 -22 -16z" fill="#dcd3c1" />
      <ellipse cx="0" cy="0" rx="22" ry="5" fill="#b88a4a" />
      <ellipse cx="-6" cy="-1" rx="6" ry="2" fill="#e6c182" />
      <path d="M-8 -8 q3 -7 0 -14 M4 -8 q3 -7 0 -14" stroke="#dcd3c1" strokeWidth="2" fill="none" opacity="0.6" />
    </g>);
    case 'chess-set': return (<g>
      <ellipse cx="0" cy="14" rx="22" ry="4" fill="#000" opacity="0.32" />
      <rect x="-22" y="-4" width="44" height="18" fill="#d9c7a3" />
      <g fill="#4a3522"><rect x="-22" y="-4" width="11" height="9" /><rect x="0" y="-4" width="11" height="9" /><rect x="-11" y="5" width="11" height="9" /><rect x="11" y="5" width="11" height="9" /></g>
      <path d="M6 -22 q-1 -10 7 -12 q8 2 7 12z" fill="#f4f0e6" /><rect x="12" y="-30" width="2" height="6" fill="#f4f0e6" /><rect x="9" y="-28" width="8" height="2" fill="#f4f0e6" />
      <g transform="translate(-12 -2) rotate(72)"><path d="M-7 16 q-1 -12 7 -14 q8 2 7 14z" fill="#3a1612" /></g>
    </g>);
    case 'ring': return (<g>
      <ellipse cx="0" cy="7" rx="14" ry="3" fill="#000" opacity="0.3" />
      <ellipse cx="0" cy="0" rx="14" ry="6" fill="none" stroke="#f0c75a" strokeWidth="4" />
      <path d="M0 -10 l5 6 -5 5 -5 -5z" fill="#cfe7f0" />
      <path d="M-2 -8 l3 3" stroke="#fff" strokeWidth="1.5" />
    </g>);
    case 'wedding-cake': return (<g>
      <ellipse cx="0" cy="20" rx="22" ry="4" fill="#000" opacity="0.32" />
      <rect x="-20" y="6" width="40" height="14" rx="2" fill="#f4f1ea" />
      <rect x="-14" y="-6" width="28" height="12" rx="2" fill="#f4f1ea" />
      <rect x="-9" y="-16" width="18" height="10" rx="2" fill="#f4f1ea" />
      <path d="M-20 6 q20 -4 40 0 M-14 -6 q14 -3 28 0 M-9 -16 q9 -2 18 0" stroke="#e0d9c3" strokeWidth="1.5" fill="none" />
      <g transform="translate(0 -20) scale(0.55)"><path d="M0 12 q-9 -8 -9 -16 q0 -6 6 -6 q3 0 3 4 q0 -4 3 -4 q6 0 6 6 q0 8 -9 16z" fill="#e24b4a" /></g>
    </g>);
    case 'trophy': return (<g>
      <ellipse cx="0" cy="20" rx="14" ry="3" fill="#000" opacity="0.32" />
      <rect x="-10" y="14" width="20" height="6" rx="1" fill="#caa030" />
      <rect x="-4" y="6" width="8" height="9" fill="#caa030" />
      <path d="M-10 -16 q10 -8 20 0 q-1 18 -10 22 q-9 -4 -10 -22z" fill="#ffd24a" />
      <path d="M-10 -14 q-7 0 -7 6 q0 7 7 8" fill="none" stroke="#ffd24a" strokeWidth="3" />
      <path d="M10 -14 q7 0 7 6 q0 7 -7 8" fill="none" stroke="#ffd24a" strokeWidth="3" />
      <ellipse cx="0" cy="-12" rx="6" ry="2" fill="#fff" opacity="0.6" />
    </g>);
    case 'microphone': return (<g>
      <ellipse cx="0" cy="16" rx="10" ry="3" fill="#000" opacity="0.32" />
      <rect x="-3" y="-2" width="6" height="18" rx="2" fill="#7a7a83" />
      <circle cx="0" cy="-10" r="9" fill="#2b2b33" />
      <circle cx="0" cy="-10" r="6" fill="#4a4f58" />
      <g stroke="#5a5f68" strokeWidth="1" fill="none"><line x1="-6" y1="-10" x2="6" y2="-10" /><line x1="0" y1="-16" x2="0" y2="-4" /></g>
    </g>);
    case 'top-hat': return (<g>
      <ellipse cx="0" cy="14" rx="22" ry="4" fill="#000" opacity="0.35" />
      <ellipse cx="0" cy="6" rx="22" ry="6" fill="#14141a" />
      <rect x="-13" y="-22" width="26" height="28" rx="2" fill="#17171e" />
      <rect x="-13" y="-4" width="26" height="6" fill="#7a2520" />
      <ellipse cx="0" cy="-22" rx="13" ry="3" fill="#2c2c36" />
      <ellipse cx="-6" cy="-19" rx="6" ry="1.5" fill="#fff" opacity="0.25" />
    </g>);
    case 'dove': return (<g>
      <path d="M0 0 q-18 -14 -34 -3 q16 3 15 16 q12 -10 18 -3 q5 -14 1 -10z" fill="#f4f1ea" />
      <path d="M-4 8 q-12 9 -22 6" stroke="#f4f1ea" strokeWidth="2" fill="none" opacity="0.6" />
    </g>);
    case 'gavel': return (<g transform="rotate(-22)">
      <ellipse cx="-2" cy="32" rx="16" ry="3" fill="#000" opacity="0.32" />
      <rect x="-22" y="-6" width="44" height="14" rx="5" fill="#c79a48" />
      <rect x="-22" y="-6" width="11" height="14" rx="4" fill="#a87c38" />
      <rect x="14" y="-6" width="10" height="14" rx="4" fill="#a87c38" />
      <rect x="-2" y="8" width="7" height="24" rx="3" fill="#c79a48" />
      <ellipse cx="0" cy="-6" rx="20" ry="2.5" fill="#fff" opacity="0.25" />
    </g>);
    case 'handcuffs': return (<g>
      <ellipse cx="0" cy="14" rx="22" ry="3" fill="#000" opacity="0.3" />
      <circle cx="-11" cy="0" r="10" fill="none" stroke="#a5acb5" strokeWidth="4" />
      <circle cx="11" cy="0" r="10" fill="none" stroke="#a5acb5" strokeWidth="4" />
      <rect x="-2" y="-2" width="4" height="4" fill="#a5acb5" />
      <circle cx="-11" cy="0" r="2" fill="#2b2b33" />
      <circle cx="11" cy="0" r="2" fill="#2b2b33" />
    </g>);
    case 'baseball-bat': return (<g transform="rotate(-30)">
      <ellipse cx="-2" cy="6" rx="26" ry="2" fill="#000" opacity="0.3" />
      <path d="M-26 -2 q22 -2 44 0 q0 4 -44 4z" fill="#caa06a" />
      <rect x="22" y="-2" width="6" height="4" fill="#a87c38" />
      <line x1="-22" y1="-2" x2="-22" y2="2" stroke="#a87c38" strokeWidth="1.5" />
    </g>);
    case 'basketball': return (<g>
      <ellipse cx="0" cy="14" rx="14" ry="3" fill="#000" opacity="0.32" />
      <circle cx="0" cy="0" r="13" fill="#d97a30" />
      <path d="M0 -13 v26 M-13 0 q13 -8 26 0 M-13 0 q13 8 26 0" stroke="#2a1d12" strokeWidth="1.5" fill="none" />
    </g>);
    case 'guitar': return (<g transform="rotate(-15)">
      <ellipse cx="0" cy="20" rx="14" ry="3" fill="#000" opacity="0.3" />
      <ellipse cx="0" cy="6" rx="12" ry="14" fill="#9c5a28" />
      <ellipse cx="0" cy="-10" rx="8" ry="10" fill="#9c5a28" />
      <rect x="-2" y="-22" width="4" height="22" fill="#7a4220" />
      <circle cx="0" cy="6" r="3.5" fill="#1c1008" />
      <g stroke="#caa030" strokeWidth="0.5"><line x1="-1" y1="-22" x2="-1" y2="18" /><line x1="1" y1="-22" x2="1" y2="18" /></g>
    </g>);
    case 'phone': return (<g>
      <ellipse cx="0" cy="20" rx="11" ry="3" fill="#000" opacity="0.3" />
      <rect x="-10" y="-18" width="20" height="36" rx="3" fill="#1c2530" />
      <rect x="-8" y="-15" width="16" height="26" rx="1" fill="#5aa0d6" opacity="0.9" />
      <circle cx="0" cy="15" r="1.5" fill="#5a5f68" />
    </g>);
    case 'briefcase': return (<g>
      <ellipse cx="0" cy="16" rx="20" ry="3" fill="#000" opacity="0.3" />
      <rect x="-20" y="-6" width="40" height="22" rx="2" fill="#6b4a26" />
      <rect x="-20" y="-2" width="40" height="2" fill="#8a6532" />
      <rect x="-4" y="-13" width="8" height="8" rx="1" fill="none" stroke="#6b4a26" strokeWidth="2.5" />
      <rect x="-2" y="4" width="4" height="3" fill="#caa030" />
    </g>);
    case 'pizza': return (<g transform="rotate(-12)">
      <ellipse cx="0" cy="16" rx="20" ry="3" fill="#000" opacity="0.3" />
      <path d="M0 -14 L20 14 L-20 14 Z" fill="#e58a44" />
      <path d="M0 -14 L20 14 L-20 14 Z" fill="none" stroke="#a85a22" strokeWidth="1.5" />
      <path d="M-13 12 q13 -6 26 0" fill="#f4e0a8" />
      <circle cx="-6" cy="6" r="2" fill="#d23b32" />
      <circle cx="4" cy="3" r="2" fill="#d23b32" />
      <circle cx="-2" cy="10" r="2" fill="#d23b32" />
    </g>);
    case 'sandwich': return (<g>
      <ellipse cx="0" cy="14" rx="22" ry="3" fill="#000" opacity="0.3" />
      <path d="M-20 8 q20 -10 40 0 l0 6 q-20 6 -40 0z" fill="#e8c98a" />
      <path d="M-18 2 q18 -6 36 0 l-1 4 q-17 5 -34 0z" fill="#bfe6b0" />
      <path d="M-17 -3 q17 -6 34 0 l-1 4 q-16 4 -32 0z" fill="#d23b32" />
      <path d="M-18 -10 q18 -10 36 0 l-1 5 q-17 5 -34 0z" fill="#e8c98a" />
      <circle cx="-12" cy="-12" r="1.2" fill="#caa06a" />
      <circle cx="6" cy="-12" r="1.2" fill="#caa06a" />
    </g>);
    case 'beer-mug': return (<g>
      <ellipse cx="0" cy="22" rx="14" ry="3" fill="#000" opacity="0.3" />
      <rect x="-12" y="-12" width="22" height="34" rx="3" fill="#cfe1ef" opacity="0.55" />
      <rect x="-12" y="-12" width="22" height="34" rx="3" fill="none" stroke="#7faecf" strokeWidth="2" />
      <rect x="-10" y="-6" width="18" height="28" fill="#e8b045" />
      <path d="M-12 -14 q11 -8 22 0 l0 4 q-11 6 -22 0z" fill="#fff" />
      <ellipse cx="-6" cy="-14" rx="5" ry="2.5" fill="#fff" />
      <path d="M10 -4 q9 0 9 10 q0 10 -9 10" fill="none" stroke="#7faecf" strokeWidth="3" />
    </g>);
    case 'liquor-glass': return (<g>
      <ellipse cx="0" cy="14" rx="14" ry="3" fill="#000" opacity="0.3" />
      <path d="M-12 -8 L12 -8 L10 12 L-10 12 Z" fill="#cfe1ef" opacity="0.5" />
      <path d="M-12 -8 L12 -8 L10 12 L-10 12 Z" fill="none" stroke="#bfd0e0" strokeWidth="1.5" />
      <path d="M-10 0 L10 0 L8.5 12 L-8.5 12 Z" fill="#caa040" />
      <rect x="-5" y="-3" width="4" height="6" fill="#fff" opacity="0.5" />
      <rect x="2" y="-1" width="3" height="4" fill="#fff" opacity="0.7" />
    </g>);
    case 'pills': return (<g>
      <ellipse cx="0" cy="16" rx="20" ry="3" fill="#000" opacity="0.3" />
      <rect x="-7" y="-10" width="14" height="22" rx="2" fill="#e8a8a0" />
      <rect x="-7" y="-12" width="14" height="5" fill="#a83b32" />
      <ellipse cx="-13" cy="14" rx="4" ry="2" fill="#dfe1ef" />
      <ellipse cx="11" cy="15" rx="4" ry="2" fill="#dfe1ef" />
      <ellipse cx="16" cy="10" rx="3.5" ry="2" fill="#cfd1df" />
    </g>);
    case 'bandage': return (<g transform="rotate(20)">
      <ellipse cx="0" cy="9" rx="18" ry="2.5" fill="#000" opacity="0.3" />
      <rect x="-18" y="-6" width="36" height="12" rx="3" fill="#f4d2a8" />
      <rect x="-3" y="-5" width="6" height="10" fill="#dcb888" opacity="0.5" />
      <g fill="#dcb888"><circle cx="-12" cy="-2" r="1.2" /><circle cx="12" cy="-2" r="1.2" /><circle cx="-12" cy="2" r="1.2" /><circle cx="12" cy="2" r="1.2" /></g>
    </g>);
    case 'tattoo-gun': return (<g transform="rotate(20)">
      <ellipse cx="0" cy="10" rx="20" ry="2.5" fill="#000" opacity="0.3" />
      <rect x="-14" y="-6" width="26" height="12" rx="3" fill="#2b2b33" />
      <rect x="-18" y="-3" width="6" height="6" rx="2" fill="#7a7a83" />
      <rect x="12" y="-3" width="11" height="6" rx="2" fill="#9aa0aa" />
      <rect x="23" y="-2" width="4" height="4" fill="#cfcfcf" />
      <line x1="23" y1="0" x2="34" y2="-5" stroke="#9aa0aa" strokeWidth="2" />
      <circle cx="-4" cy="0" r="2" fill="#7f77dd" />
    </g>);
    case 'baby-bottle': return (<g>
      <ellipse cx="0" cy="22" rx="11" ry="3" fill="#000" opacity="0.3" />
      <rect x="-10" y="-8" width="20" height="30" rx="3" fill="#dfe9f2" opacity="0.65" />
      <rect x="-10" y="-8" width="20" height="30" rx="3" fill="none" stroke="#bfd0e0" strokeWidth="1.5" />
      <rect x="-8" y="2" width="16" height="18" rx="2" fill="#f4f0e6" />
      <rect x="-7" y="-14" width="14" height="6" rx="3" fill="#e8c98a" />
      <path d="M-4 -22 q4 -5 8 0 q0 4 -4 6 q-4 -2 -4 -6z" fill="#e8c98a" />
    </g>);
    case 'cake': return (<g>
      <ellipse cx="0" cy="20" rx="22" ry="4" fill="#000" opacity="0.32" />
      <rect x="-20" y="6" width="40" height="14" rx="2" fill="#f4f1ea" />
      <path d="M-20 6 q20 -8 40 0" stroke="#d4537e" strokeWidth="2" fill="none" />
      <path d="M-20 12 q20 -8 40 0" stroke="#d4537e" strokeWidth="2" fill="none" />
      <rect x="-2" y="-8" width="4" height="14" fill="#d4537e" />
      <path d="M0 -14 q-4 -5 0 -10 q4 5 0 10z" fill="#ffc740" />
    </g>);
    case 'heart': return (<g>
      <path d="M0 14 q-16 -10 -16 -22 q0 -8 8 -8 q4 0 8 6 q4 -6 8 -6 q8 0 8 8 q0 12 -16 22z" fill="#e24b4a" />
      <path d="M-6 -10 q4 -3 8 0" stroke="#fff" strokeWidth="1.8" fill="none" opacity="0.55" />
    </g>);
    case 'gift-box': return (<g>
      <ellipse cx="0" cy="16" rx="18" ry="3" fill="#000" opacity="0.3" />
      <rect x="-16" y="-4" width="32" height="20" rx="1" fill="#d4537e" />
      <rect x="-16" y="-6" width="32" height="6" fill="#b04267" />
      <rect x="-3" y="-6" width="6" height="22" fill="#ffd24a" />
      <path d="M0 -6 q-8 -10 -14 -2 q4 4 14 2z M0 -6 q8 -10 14 -2 q-4 4 -14 2z" fill="#ffd24a" />
    </g>);
    case 'money-stack': return (<g>
      <ellipse cx="0" cy="14" rx="22" ry="3" fill="#000" opacity="0.3" />
      <rect x="-20" y="2" width="40" height="12" rx="1" fill="#6fbf8e" transform="rotate(-4 0 8)" />
      <rect x="-20" y="-4" width="40" height="12" rx="1" fill="#7fc99e" />
      <text x="0" y="6" textAnchor="middle" fontFamily="Inter,Arial Black,Arial" fontSize="11" fontWeight="900" fill="#1d4a30">$</text>
    </g>);
    case 'clothes-stack': return (<g>
      <ellipse cx="0" cy="22" rx="22" ry="3" fill="#000" opacity="0.3" />
      <rect x="-20" y="12" width="40" height="10" rx="2" fill="#5aa0d6" />
      <rect x="-18" y="2" width="36" height="10" rx="2" fill="#e24b4a" />
      <rect x="-16" y="-8" width="32" height="10" rx="2" fill="#caa030" />
      <rect x="-14" y="-18" width="28" height="10" rx="2" fill="#6fbf8e" />
    </g>);
    case 'dog': return (<g>
      <ellipse cx="0" cy="14" rx="20" ry="3" fill="#000" opacity="0.32" />
      <ellipse cx="-2" cy="4" rx="18" ry="9" fill="#8a6532" />
      <circle cx="-16" cy="-2" r="8" fill="#8a6532" />
      <path d="M-22 -8 q-2 -6 4 -6 q3 4 0 8z" fill="#7a5a28" />
      <circle cx="-18" cy="-2" r="1.4" fill="#1c1008" />
      <rect x="-12" y="11" width="3" height="6" fill="#8a6532" />
      <rect x="-2" y="11" width="3" height="6" fill="#8a6532" />
      <path d="M14 0 q4 -8 8 -6" stroke="#8a6532" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>);
    case 'cat': return (<g>
      <ellipse cx="0" cy="14" rx="18" ry="3" fill="#000" opacity="0.3" />
      <ellipse cx="-2" cy="4" rx="16" ry="8" fill="#3a3a3a" />
      <circle cx="-14" cy="-2" r="7" fill="#3a3a3a" />
      <path d="M-20 -10 l3 -6 3 6z M-10 -10 l3 -6 3 6z" fill="#3a3a3a" />
      <circle cx="-16" cy="-2" r="1.2" fill="#caa030" />
      <circle cx="-12" cy="-2" r="1.2" fill="#caa030" />
      <path d="M14 -2 q6 -4 8 -10" stroke="#3a3a3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>);
    case 'key': return (<g transform="rotate(-15)">
      <ellipse cx="0" cy="6" rx="18" ry="2.5" fill="#000" opacity="0.3" />
      <circle cx="-14" cy="0" r="8" fill="none" stroke="#caa030" strokeWidth="3" />
      <circle cx="-14" cy="0" r="3" fill="#1c1008" />
      <rect x="-6" y="-2" width="22" height="4" fill="#caa030" />
      <rect x="10" y="2" width="3" height="4" fill="#caa030" />
      <rect x="14" y="2" width="3" height="6" fill="#caa030" />
    </g>);
    case 'coffee-cup': return (<g>
      <ellipse cx="0" cy="18" rx="14" ry="3" fill="#000" opacity="0.32" />
      <path d="M-12 -8 L12 -8 L10 16 L-10 16 Z" fill="#7a3b22" />
      <rect x="-13" y="-10" width="26" height="6" rx="1" fill="#3a1c10" />
      <rect x="-3" y="-14" width="6" height="4" fill="#fff" />
      <path d="M-4 -22 q3 -6 0 -10 M4 -22 q3 -6 0 -10" stroke="#cfcfcf" strokeWidth="1.5" fill="none" opacity="0.6" />
    </g>);
    default: return null;
  }
}

export interface MemeSceneProps { scene?: string; color: string; mono: string; props?: string[]; jokeId?: number; muted?: boolean; ariaLabel?: string; className?: string; }

export function MemeScene({ scene = 'default', color, mono, props: jokeProps, jokeId, muted = false, ariaLabel, className }: MemeSceneProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bg = `b${raw}`, vig = `v${raw}`;
  const mid = shade(color, 0.6), dark = shade(color, 0.26), light = shade(color, 1.65);

  // Bespoke scene overrides the template entirely (and skips prop overlay).
  const bespoke = jokeId != null ? bespokeSVG(jokeId, color, mid, dark) : null;

  const inner = bespoke ?? (() => {
    switch (scene) {
      case 'diner': return (<>
        <rect x="0" y="42" width="320" height="46" fill={shade(color, 0.42)} opacity="0.6" />
        <rect x="22" y="20" width="78" height="30" rx="4" fill="#160807" stroke={light} strokeWidth="2" />
        <text x="61" y="40" textAnchor="middle" fontFamily="Arial" fontSize="13" fontWeight="800" fill={light} letterSpacing="1">OPEN</text>
        <ellipse cx="160" cy="128" rx="132" ry="14" fill={dark} />
        <rect x="28" y="104" width="264" height="16" rx="4" fill={mid} />
        <g transform="translate(150 76)">
          <path d="M0 12 q4 -9 0 -16 M10 12 q4 -9 0 -16" stroke="#e7c8a8" strokeWidth="2.2" fill="none" opacity="0.6" />
          <rect x="-7" y="14" width="34" height="24" rx="5" fill="#efe7d6" /><path d="M27 18 q13 0 13 11 q0 11 -13 11" fill="none" stroke="#efe7d6" strokeWidth="4.5" />
          <ellipse cx="10" cy="16" rx="17" ry="3.6" fill="#6b3b22" />
        </g>
      </>);
      case 'livingroom': return (<>
        <rect x="208" y="16" width="94" height="66" rx="3" fill={light} opacity="0.12" />
        <g stroke={light} strokeWidth="2" opacity="0.22" fill="none"><rect x="208" y="16" width="94" height="66" rx="3" /><line x1="255" y1="16" x2="255" y2="82" /><line x1="208" y1="49" x2="302" y2="49" /></g>
        <ellipse cx="160" cy="138" rx="140" ry="12" fill={dark} />
        <rect x="30" y="96" width="260" height="40" rx="12" fill="#c96a28" />
        <rect x="24" y="72" width="34" height="52" rx="10" fill="#d9772e" /><rect x="262" y="72" width="34" height="52" rx="10" fill="#d9772e" />
        <rect x="70" y="80" width="78" height="26" rx="8" fill="#e08b46" /><rect x="172" y="80" width="78" height="26" rx="8" fill="#e08b46" />
        <rect x="292" y="64" width="4" height="58" fill="#6a5a48" /><path d="M282 64 l20 0 6 -18 -32 0z" fill="#ffd76b" />
      </>);
      case 'courtroom': return (<>
        <g stroke="#d7ece7" strokeWidth="7" opacity="0.2"><line x1="56" y1="14" x2="56" y2="140" /><line x1="106" y1="14" x2="106" y2="140" /><line x1="214" y1="14" x2="214" y2="140" /><line x1="264" y1="14" x2="264" y2="140" /><line x1="32" y1="26" x2="300" y2="26" /></g>
        <ellipse cx="160" cy="128" rx="62" ry="10" fill={dark} />
        <rect x="120" y="110" width="80" height="14" rx="4" fill="#6b4a26" /><rect x="120" y="106" width="80" height="7" rx="3" fill="#8a6532" />
        <g transform="translate(176 64) rotate(-22)">
          <rect x="-6" y="-2" width="92" height="22" rx="7" fill="#c79a48" /><rect x="-6" y="-2" width="16" height="22" rx="5" fill="#a87c38" /><rect x="74" y="-2" width="12" height="22" rx="5" fill="#a87c38" />
          <rect x="34" y="20" width="11" height="44" rx="4" fill="#c79a48" /><ellipse cx="40" cy="-2" rx="46" ry="4" fill="#fff" opacity="0.25" />
        </g>
        <g transform="translate(244 42) rotate(-12)"><rect x="-28" y="-13" width="56" height="26" rx="3" fill="none" stroke="#e24b4a" strokeWidth="3" /><text x="0" y="7" textAnchor="middle" fontFamily="Arial Black,Arial" fontSize="17" fontWeight="900" fill="#e24b4a" letterSpacing="1">JAIL</text></g>
      </>);
      case 'stage': return (<>
        <polygon points="168,2 214,150 122,150" fill="#ffffff" opacity="0.08" />
        <ellipse cx="158" cy="130" rx="26" ry="6" fill={dark} />
        <g transform="translate(214 86)"><rect x="0" y="0" width="40" height="6" rx="3" fill={shade(color, 0.5)} /><rect x="6" y="6" width="6" height="34" fill="#5a4a38" /><rect x="28" y="6" width="6" height="34" fill="#5a4a38" /><rect x="-2" y="-7" width="44" height="9" rx="4" fill="#7a4a28" /></g>
        <rect x="155" y="66" width="4" height="58" fill="#cfcfcf" />
        <rect x="148" y="120" width="20" height="7" rx="2" fill="#9aa0aa" />
        <circle cx="157" cy="60" r="10" fill="#2b2b33" /><circle cx="157" cy="60" r="6" fill="#4a4f58" />
        <g fill="#ffe2b0"><path d="M96 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" /><path d="M250 56 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" /></g>
      </>);
      case 'nursery': return (<>
        <g stroke={light} strokeWidth="6" opacity="0.2"><line x1="50" y1="14" x2="50" y2="120" /><line x1="92" y1="14" x2="92" y2="120" /><line x1="228" y1="14" x2="228" y2="120" /><line x1="270" y1="14" x2="270" y2="120" /><line x1="34" y1="24" x2="286" y2="24" /></g>
        <ellipse cx="160" cy="130" rx="132" ry="14" fill={dark} />
        <g fontFamily="Arial Black,Arial" fontWeight="900" fontSize="15" textAnchor="middle">
          <g transform="translate(132 112)"><rect x="-16" y="-16" width="32" height="32" rx="4" fill="#e2705a" /><text y="6" fill="#fff">A</text></g>
          <g transform="translate(166 112)"><rect x="-16" y="-16" width="32" height="32" rx="4" fill="#5aa0d6" /><text y="6" fill="#fff">B</text></g>
          <g transform="translate(149 80)"><rect x="-16" y="-16" width="32" height="32" rx="4" fill="#6fbf8e" /><text y="6" fill="#fff">C</text></g>
        </g>
      </>);
      case 'bar': return (<>
        <rect x="206" y="18" width="86" height="26" rx="13" fill="none" stroke={light} strokeWidth="3" opacity="0.85" /><text x="249" y="36" textAnchor="middle" fontFamily="Arial Black,Arial" fontSize="14" fontWeight="900" fill={light} letterSpacing="2">BAR</text>
        <rect x="22" y="52" width="120" height="5" rx="2" fill={mid} />
        <g><rect x="30" y="30" width="12" height="22" rx="3" fill="#6fbf8e" /><rect x="50" y="26" width="11" height="26" rx="3" fill="#d23b32" /><rect x="68" y="34" width="13" height="18" rx="3" fill="#caa030" /><rect x="90" y="28" width="11" height="24" rx="3" fill="#5aa0d6" /><rect x="110" y="33" width="12" height="19" rx="3" fill="#b07fd6" /></g>
        <rect x="0" y="112" width="320" height="20" fill={shade(color, 0.45)} />
      </>);
      case 'outdoors': return (<>
        <circle cx="56" cy="38" r="17" fill="#ffd76b" opacity="0.8" />
        <g fill="#ffffff" opacity="0.22"><ellipse cx="220" cy="34" rx="26" ry="11" /><ellipse cx="244" cy="30" rx="18" ry="9" /><ellipse cx="198" cy="32" rx="14" ry="8" /></g>
        <ellipse cx="70" cy="156" rx="130" ry="44" fill={shade(color, 0.5)} />
        <ellipse cx="256" cy="160" rx="120" ry="46" fill={shade(color, 0.4)} />
        <g><rect x="172" y="78" width="8" height="38" rx="2" fill="#6b4a28" /><circle cx="176" cy="72" r="18" fill="#4e8c5a" /></g>
      </>);
      case 'office': return (<>
        <circle cx="44" cy="18" r="6" fill="#ffd76b" /><circle cx="44" cy="18" r="15" fill="#ffe9a8" opacity="0.16" />
        <circle cx="276" cy="18" r="6" fill="#ffd76b" /><circle cx="276" cy="18" r="15" fill="#ffe9a8" opacity="0.16" />
        <ellipse cx="160" cy="132" rx="128" ry="14" fill={dark} />
        <rect x="40" y="104" width="240" height="18" rx="4" fill={mid} />
        <rect x="182" y="60" width="58" height="40" rx="4" fill="#1c2530" /><rect x="187" y="65" width="48" height="30" rx="2" fill={light} opacity="0.9" /><rect x="205" y="100" width="12" height="6" fill="#1c2530" />
      </>);
      default: return (<>
        <polygon points="160,2 206,150 114,150" fill="#ffffff" opacity="0.07" />
        <rect x="128" y="40" width="64" height="64" rx="16" fill={color} />
        <text x="160" y="86" textAnchor="middle" fontFamily="Inter,Arial Black,Arial" fontSize="34" fontWeight="900" fill={inkFor(color)} letterSpacing="1">{mono}</text>
        <g fill="#ffe2b0"><path d="M92 52 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2z" /><path d="M226 92 l1.8 4.5 4.5 1.8 -4.5 1.8 -1.8 4.5 -1.8 -4.5 -4.5 -1.8 4.5 -1.8z" /></g>
      </>);
    }
  })();

  const slots = PROP_SLOTS[scene] ?? PROP_SLOTS.default;
  // Bespoke scenes are self-contained — skip the prop overlay so they aren't double-decorated.
  const propEls = bespoke ? null : (jokeProps ?? []).slice(0, 2).map((p, i) => {
    const node = propSVG(p);
    if (!node) return null;
    const s = slots[i];
    return <g key={`p${i}-${p}`} transform={`translate(${s.x} ${s.y})`}>{node}</g>;
  });

  // Accessibility: announce the scene to screen readers; otherwise mark decorative.
  const a11y = ariaLabel
    ? { role: 'img' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const };
  return (
    <svg viewBox="0 0 320 150" className={className} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false" {...a11y}>
      <defs>
        <radialGradient id={bg} cx="50%" cy="24%" r="95%">
          <stop offset="0%" stopColor={color} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={dark} />
        </radialGradient>
        <radialGradient id={vig} cx="50%" cy="46%" r="78%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <rect width="320" height="150" fill={`url(#${bg})`} />
      {inner}
      <rect width="320" height="150" fill={`url(#${vig})`} />
      {propEls}
      {/* Mute mode: dark overlay so dual-card show colors don't clash visually; color survives as accent. */}
      {muted && <rect width="320" height="150" fill="#000" opacity="0.42" />}
    </svg>
  );
}

export default MemeScene;

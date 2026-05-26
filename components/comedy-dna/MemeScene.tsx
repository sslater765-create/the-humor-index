import { useId } from 'react';

/**
 * MemeScene — illustrated, face-free scene backdrops for Comedy DNA battle cards.
 *
 * Each `scene` is a reusable setting (not a per-joke drawing), told through
 * iconic props + a spotlight, in a flat screen-print style. The dominant tint
 * is driven by the show's brand color so a card instantly reads as "from show X".
 *
 * Scene tags MUST stay in sync with the pipeline classifier in
 * build_comedy_dna_data.py (SCENES / SHOW_SCENE / SCENE_KW).
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

export interface MemeSceneProps { scene?: string; color: string; mono: string; className?: string; }

export function MemeScene({ scene = 'default', color, mono, className }: MemeSceneProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bg = `b${raw}`, vig = `v${raw}`;
  const mid = shade(color, 0.6), dark = shade(color, 0.26), light = shade(color, 1.65);

  const inner = (() => {
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
        <g transform="translate(94 80)"><rect x="0" y="6" width="13" height="22" rx="3" fill="#d23b32" /><rect x="3" y="0" width="7" height="8" rx="2" fill="#b32d25" /></g>
      </>);
      case 'livingroom': return (<>
        <rect x="208" y="16" width="94" height="66" rx="3" fill={light} opacity="0.12" />
        <g stroke={light} strokeWidth="2" opacity="0.22" fill="none"><rect x="208" y="16" width="94" height="66" rx="3" /><line x1="255" y1="16" x2="255" y2="82" /><line x1="208" y1="49" x2="302" y2="49" /></g>
        <ellipse cx="160" cy="138" rx="140" ry="12" fill={dark} />
        <rect x="30" y="96" width="260" height="40" rx="12" fill="#c96a28" />
        <rect x="24" y="72" width="34" height="52" rx="10" fill="#d9772e" /><rect x="262" y="72" width="34" height="52" rx="10" fill="#d9772e" />
        <rect x="70" y="80" width="78" height="26" rx="8" fill="#e08b46" /><rect x="172" y="80" width="78" height="26" rx="8" fill="#e08b46" />
        <rect x="92" y="82" width="26" height="24" rx="7" fill={color} transform="rotate(-8 105 94)" />
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
        <g transform="translate(232 92) rotate(18)"><circle cx="0" cy="0" r="11" fill="#f4d06a" stroke="#caa030" strokeWidth="2" /><circle cx="-4" cy="-3" r="2.4" fill="#fff" /><rect x="-3" y="9" width="6" height="20" rx="3" fill="#e58a44" /></g>
      </>);
      case 'bar': return (<>
        <rect x="206" y="18" width="86" height="26" rx="13" fill="none" stroke={light} strokeWidth="3" opacity="0.85" /><text x="249" y="36" textAnchor="middle" fontFamily="Arial Black,Arial" fontSize="14" fontWeight="900" fill={light} letterSpacing="2">BAR</text>
        <rect x="22" y="52" width="120" height="5" rx="2" fill={mid} />
        <g><rect x="30" y="30" width="12" height="22" rx="3" fill="#6fbf8e" /><rect x="50" y="26" width="11" height="26" rx="3" fill="#d23b32" /><rect x="68" y="34" width="13" height="18" rx="3" fill="#caa030" /><rect x="90" y="28" width="11" height="24" rx="3" fill="#5aa0d6" /><rect x="110" y="33" width="12" height="19" rx="3" fill="#b07fd6" /></g>
        <rect x="0" y="112" width="320" height="20" fill={shade(color, 0.45)} />
        <g transform="translate(160 74)"><path d="M-22 0 L22 0 L2 26 L-2 26 Z" fill="#bfe6b0" stroke="#9fce8e" strokeWidth="1.5" /><ellipse cx="0" cy="0" rx="23" ry="4" fill="#dff0d2" /><rect x="-2" y="26" width="4" height="20" fill="#cdd6c8" /><ellipse cx="0" cy="47" rx="13" ry="3" fill={dark} /><circle cx="13" cy="-2" r="4" fill="#d23b32" /></g>
      </>);
      case 'outdoors': return (<>
        <circle cx="56" cy="38" r="17" fill="#ffd76b" opacity="0.8" />
        <g fill="#ffffff" opacity="0.22"><ellipse cx="220" cy="34" rx="26" ry="11" /><ellipse cx="244" cy="30" rx="18" ry="9" /><ellipse cx="198" cy="32" rx="14" ry="8" /></g>
        <ellipse cx="70" cy="156" rx="130" ry="44" fill={shade(color, 0.5)} />
        <ellipse cx="256" cy="160" rx="120" ry="46" fill={shade(color, 0.4)} />
        <g><rect x="92" y="84" width="8" height="34" rx="2" fill="#6b4a28" /><circle cx="96" cy="78" r="18" fill="#4e8c5a" /><circle cx="84" cy="86" r="12" fill="#5a9c66" /><circle cx="108" cy="86" r="12" fill="#5a9c66" /></g>
        <g transform="translate(196 104)"><rect x="0" y="0" width="60" height="6" rx="2" fill="#7a5a3a" /><rect x="0" y="10" width="60" height="6" rx="2" fill="#7a5a3a" /><rect x="4" y="6" width="5" height="20" fill="#5a4128" /><rect x="51" y="6" width="5" height="20" fill="#5a4128" /></g>
      </>);
      case 'office': return (<>
        <circle cx="44" cy="18" r="6" fill="#ffd76b" /><circle cx="44" cy="18" r="15" fill="#ffe9a8" opacity="0.16" />
        <circle cx="276" cy="18" r="6" fill="#ffd76b" /><circle cx="276" cy="18" r="15" fill="#ffe9a8" opacity="0.16" />
        <ellipse cx="160" cy="132" rx="128" ry="14" fill={dark} />
        <rect x="40" y="104" width="240" height="18" rx="4" fill={mid} />
        <rect x="182" y="60" width="58" height="40" rx="4" fill="#1c2530" /><rect x="187" y="65" width="48" height="30" rx="2" fill={light} opacity="0.9" /><rect x="205" y="100" width="12" height="6" fill="#1c2530" />
        <g transform="translate(70 86)"><rect x="0" y="0" width="18" height="18" rx="3" fill="#e8e2d6" /><path d="M18 3 q8 0 8 6 q0 6 -8 6" fill="none" stroke="#e8e2d6" strokeWidth="3" /></g>
        <rect x="104" y="92" width="42" height="12" rx="2" fill="#cfc8ba" transform="rotate(-4 125 98)" />
        <g transform="translate(252 88)"><rect x="0" y="4" width="14" height="12" rx="2" fill="#7a4a28" /><circle cx="7" cy="0" r="9" fill="#4e8c5a" /></g>
      </>);
      default: return (<>
        <polygon points="160,2 206,150 114,150" fill="#ffffff" opacity="0.07" />
        <rect x="128" y="40" width="64" height="64" rx="16" fill={color} />
        <text x="160" y="86" textAnchor="middle" fontFamily="Inter,Arial Black,Arial" fontSize="34" fontWeight="900" fill={inkFor(color)} letterSpacing="1">{mono}</text>
        <g fill="#ffe2b0"><path d="M92 52 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2z" /><path d="M226 92 l1.8 4.5 4.5 1.8 -4.5 1.8 -1.8 4.5 -1.8 -4.5 -4.5 -1.8 4.5 -1.8z" /></g>
      </>);
    }
  })();

  return (
    <svg viewBox="0 0 320 150" className={className} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
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
    </svg>
  );
}

export default MemeScene;

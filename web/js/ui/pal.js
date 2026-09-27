// Molecule Pals: soft, clay-like characters drawn in SVG (Components/MoleculeFace.swift).
import { character } from '../data.js';
import { esc } from './dom.js';

const polygon = (sides, r, points = sides, inner = r) => {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const radius = points === sides ? r : (i % 2 === 0 ? r : inner);
    const a = (i / points) * 2 * Math.PI - Math.PI / 2;
    pts.push(`${(50 + radius * Math.cos(a)).toFixed(2)},${(50 + radius * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
};

// Rounded joins on a wide stroke give the polygons their soft, pinched-clay corners.
export const OUTLINES = {
  hexagon: polygon(6, 45),
  pentagon: polygon(5, 45),
  diamond: polygon(4, 45),
  circle: '<circle cx="50" cy="50" r="46"/>',
  capsule: '<rect x="3" y="18" width="94" height="64" rx="32"/>',
  drop: '<path d="M50 5C66 19 87 37 87 60A37 37 0 0 1 13 60C13 37 34 19 50 5Z"/>',
  gem: polygon(8, 47, 16, 39),
  squircle: '<rect x="6" y="6" width="88" height="88" rx="30"/>',
};
export const hexOutline = () => OUTLINES.hexagon;

const INK = '#1F2447';

function eyes(closed) {
  if (closed) {
    return [32.5, 67.5].map(x =>
      `<path d="M${x - 7} 46Q${x} 55 ${x + 7} 46" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>`).join('');
  }
  return `<g class="eyes">${[32.5, 67.5].map(x => `
    <ellipse cx="${x}" cy="47.5" rx="8.2" ry="9.6" fill="#fff"/>
    <circle cx="${x + 1}" cy="49.2" r="5.6" fill="${INK}"/>
    <circle cx="${x + 3.2}" cy="46.6" r="2.2" fill="#fff"/>
    <circle cx="${x - 0.8}" cy="52" r="1" fill="#fff" opacity=".8"/>`).join('')}</g>`;
}

export function features({ excited = false, sleepy = false } = {}) {
  const mouth = excited
    ? `<path d="M38.5 61H61.5Q50 76 38.5 61Z" fill="${INK}"/><ellipse cx="50" cy="66.6" rx="5.2" ry="2.6" fill="#FF6B8B"/>`
    : `<path d="M40 61.5Q50 72 60 61.5" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>`;
  return `<ellipse cx="22.5" cy="59" rx="6.5" ry="4.5" fill="#FF4D6D" opacity=".32"/>
    <ellipse cx="77.5" cy="59" rx="6.5" ry="4.5" fill="#FF4D6D" opacity=".32"/>${eyes(sleepy)}${mouth}`;
}

const seedOf = id => [...id].reduce((a, ch) => a + ch.codePointAt(0), 0) % 97 / 97;

/**
 * A Molecule Pal. `mystery` draws the undiscovered silhouette with a glowing outline;
 * `still` turns off the idle bob and blink.
 */
export function pal(id, { size = 90, excited = false, still = false, mystery = false, shadow = true, label } = {}) {
  const c = character(id);
  const outline = OUTLINES[c.shape] || OUTLINES.circle;
  const alive = !still && !mystery;
  const name = label ?? (mystery ? 'Undiscovered Molecule Pal' : c.name);
  const body = mystery
    ? `<g fill="url(#nq-mystery)" stroke="${c.color}" stroke-width="3" stroke-linejoin="round" class="mystery-shape">${outline}</g>
       <g fill="none" stroke="${c.color}" stroke-opacity=".35" stroke-width="9" stroke-linejoin="round">${outline}</g>
       <text x="50" y="53" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="700" fill="#fff" fill-opacity=".92" class="q">?</text>`
    : `<g fill="${c.color}" stroke="${c.color}" stroke-width="6" stroke-linejoin="round">${outline}</g>
       <g fill="url(#nq-shade)">${outline}</g>
       <g fill="url(#nq-shine)">${outline}</g>
       <ellipse cx="31" cy="23" rx="10" ry="5.5" fill="#fff" opacity=".55" transform="rotate(-28 31 23)"/>
       <g fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linejoin="round">${outline}</g>
       ${features({ excited, sleepy: c.id === 'melatonin' })}
       <text x="86" y="13" text-anchor="middle" dominant-baseline="central" font-size="28">${c.accessory}</text>`;
  return `<svg class="pal${alive ? ' alive' : ''}${mystery ? ' is-mystery' : ''}" viewBox="-6 -8 112 122" width="${size}" height="${size * 122 / 112}"
      style="--c:${c.color};--d:${(-seedOf(c.id) * 10).toFixed(2)}s" role="img" aria-label="${esc(name)}">
    ${shadow ? '<ellipse class="ground" cx="50" cy="108" rx="30" ry="5"/>' : ''}
    <g class="bob">${body}</g>
  </svg>`;
}

/** A glucose/fiber bead used by Enzyme Scissors. */
export function bead(isFiber, freed) {
  return `<svg class="bead${freed ? ' freed' : ''}" viewBox="-4 -4 108 108" width="44" height="44" aria-hidden="true">
    <g fill="${isFiber ? '#6BBF59' : '#FF9F1C'}" stroke="${isFiber ? '#6BBF59' : '#FF9F1C'}" stroke-width="8" stroke-linejoin="round">${OUTLINES.hexagon}</g>
    <g fill="url(#nq-shade)">${OUTLINES.hexagon}</g><g fill="url(#nq-shine)">${OUTLINES.hexagon}</g>
    <g transform="translate(0 6)">${features({ excited: freed })}</g>
  </svg>`;
}

/** Gradients and filters every drawing shares, placed once in the document. */
export const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <radialGradient id="nq-shine" cx=".32" cy=".26" r=".62">
    <stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nq-shade" cx=".42" cy=".36" r=".72">
    <stop offset=".55" stop-color="#1F2447" stop-opacity="0"/><stop offset="1" stop-color="#1F2447" stop-opacity=".26"/>
  </radialGradient>
  <radialGradient id="nq-mystery" cx=".4" cy=".3" r=".8">
    <stop offset="0" stop-color="#5B5F97"/><stop offset="1" stop-color="#262A55"/>
  </radialGradient>
  <filter id="nq-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2"/></filter>
  <filter id="nq-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
</defs></svg>`;

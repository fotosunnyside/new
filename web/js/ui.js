// Shared building blocks, mirroring Components/*.swift and the reusable views.
import { CAST, character, firstName, shortMolecule, helperCharacterID, uniqueStars, FAMILY } from './data.js';
import { store } from './store.js';

export const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// MARK: - Molecule faces

const polygon = (sides, r, points = sides, inner = r) => {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const radius = points === sides ? r : (i % 2 === 0 ? r : inner);
    const a = (i / points) * 2 * Math.PI - Math.PI / 2;
    pts.push(`${(50 + radius * Math.cos(a)).toFixed(2)},${(50 + radius * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
};

const OUTLINES = {
  hexagon: polygon(6, 47),
  pentagon: polygon(5, 47),
  diamond: polygon(4, 47),
  circle: '<circle cx="50" cy="50" r="47"/>',
  capsule: '<rect x="2" y="17" width="96" height="66" rx="33"/>',
  drop: '<path d="M50 4C66 18 88 36 88 60A38 38 0 0 1 12 60C12 36 34 18 50 4Z"/>',
  gem: polygon(8, 48, 16, 39.4),
  squircle: '<rect x="5" y="5" width="90" height="90" rx="29"/>',
};

const INK = '#2B2D42';

function eyes(closed) {
  if (closed) {
    return [32.5, 67.5].map(x =>
      `<path d="M${x - 6.5} 45Q${x} 55 ${x + 6.5} 45" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`).join('');
  }
  return `<g class="eyes">${[32.5, 67.5].map(x => `
    <ellipse cx="${x}" cy="47.5" rx="7.5" ry="9" fill="#fff"/>
    <circle cx="${x + 1}" cy="49.5" r="4.75" fill="${INK}"/>
    <circle cx="${x + 3}" cy="47.5" r="1.75" fill="#fff"/>`).join('')}</g>`;
}

export function features({ excited = false, sleepy = false } = {}) {
  const mouth = excited
    ? `<path d="M38 61.5H62Q50 75.5 38 61.5Z" fill="${INK}"/><ellipse cx="50" cy="66.3" rx="5" ry="2.4" fill="#FF6B8B"/>`
    : `<path d="M39 61.5Q50 73.5 61 61.5" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `<circle cx="23.5" cy="58" r="5.5" fill="#FF4D6D" opacity=".35"/>
    <circle cx="76.5" cy="58" r="5.5" fill="#FF4D6D" opacity=".35"/>${eyes(sleepy)}${mouth}`;
}

/** A personified molecule: a colorful body shape with eyes, a smile, rosy cheeks and an accessory. */
export function face(id, { size = 90, excited = false, animated = true, silhouette = false } = {}) {
  const c = character(id);
  const outline = OUTLINES[c.shape] || OUTLINES.circle;
  const tint = silhouette ? '#C9CCD6' : c.color;
  const seed = [...c.id].reduce((a, ch) => a + ch.codePointAt(0), 0) % 97 / 97;
  const moving = animated && !silhouette;
  const inner = silhouette
    ? '<text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="45" font-weight="900" fill="#fff">?</text>'
    : `${features({ excited, sleepy: c.id === 'melatonin' })}
       <text x="86" y="14" text-anchor="middle" dominant-baseline="central" font-size="30">${c.accessory}</text>`;
  return `<svg class="face${moving ? ' alive' : ''}" viewBox="-4 -4 108 108" width="${size}" height="${size}"
      style="--c:${tint};--d:${(-seed * 10).toFixed(2)}s" role="img" aria-label="${esc(silhouette ? 'Undiscovered molecule' : c.name)}">
    <g class="bob">
      <g fill="${tint}">${outline}</g>
      <g fill="url(#nq-shine)">${outline}</g>
      <g fill="none" stroke="#fff" stroke-opacity=".95" stroke-width="${Math.max(4.5, 200 / size)}" stroke-linejoin="round">${outline}</g>
      ${inner}
    </g>
  </svg>`;
}

/** A hexagon glucose / fiber bead used by Enzyme Scissors. */
export function bead(isFiber, freed) {
  return `<svg class="bead${freed ? ' freed' : ''}" viewBox="0 0 100 100" width="44" height="44" aria-hidden="true">
    <g fill="${isFiber ? '#6BBF59' : '#FF9F1C'}" stroke="#fff" stroke-width="7" stroke-linejoin="round">${polygon(6, 47)}</g>
    <g transform="translate(0 7)">${features({ excited: freed })}</g>
  </svg>`;
}

/** Shared defs (the face highlight gradient) placed once in the document. */
export const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="nq-shine" cx="0.3" cy="0.25" r="0.6">
    <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient></defs></svg>`;

// MARK: - Small pieces

export const stars = (count, total = 3, size = 18) =>
  `<span class="stars" style="font-size:${size}px" role="img" aria-label="${count} of ${total} stars">${
    Array.from({ length: total }, (_, i) => `<span class="${i < count ? 'on' : ''}">★</span>`).join('')}</span>`;

export const pill = (text, color = 'var(--pink)') => `<span class="pill" style="background:${color}">${esc(text)}</span>`;

export const progress = (value, color = 'var(--pink)') =>
  `<div class="progress"><div style="width:max(12px, ${Math.min(Math.max(value, 0), 1) * 100}%);background:${color}"></div></div>`;

export const sectionHeader = (title, emoji = '') =>
  `<h2 class="section">${emoji ? `<span aria-hidden="true">${emoji}</span> ` : ''}${esc(title)}</h2>`;

export const scoreBadge = (label, value, color) =>
  `<div class="score-badge" style="background:${color}"><small>${esc(label)}</small><b>${esc(value)}</b></div>`;

export const tags = (list, color) =>
  `<div class="flow">${list.map(t => `<span class="tag" style="background:${color}">${esc(t)}</span>`).join('')}</div>`;

/** Chips for enzymes, vitamins and minerals. Helpers that are also Molecule Pals can be tapped. */
export function helperChips(helpers, title = 'Helpers on this step') {
  return `<div class="helpers"><div class="eyebrow">${esc(title)}</div><div class="flow">${helpers.map(h => {
    const id = helperCharacterID(h);
    if (!id) return `<span class="chip">${esc(h)}</span>`;
    const c = character(id);
    return `<a class="chip pal" href="#pal-${id}" style="--c:${c.color}" title="Meet ${esc(c.name)}">
      ${face(id, { size: 24, animated: false })}<span>${esc(h)}</span>${store.isCollected(id) ? '' : '<span class="new">NEW</span>'}</a>`;
  }).join('')}</div></div>`;
}

/** A row of faces connected by arrows: how one molecule turns into the next. */
export function transformationChain(ids, size = 54) {
  return `<div class="chain">${ids.map((id, i) => `${i ? '<span class="arrow" aria-hidden="true">→</span>' : ''}
    <div class="link" style="width:${size + 20}px">${face(id, { size, animated: false })}<span>${esc(shortMolecule(character(id)))}</span></div>`).join('')}</div>`;
}

export function pathwayCard(p) {
  const fam = FAMILY[p.family];
  return `<a class="card row pathway-card" href="#pathway-${p.id}">
    <span class="emoji-tile" style="background:color-mix(in srgb, ${fam.color} 22%, transparent)">${p.emoji}</span>
    <span class="grow">
      <b class="title">${esc(p.title)}</b>
      <span class="sub">${esc(p.subtitle)}</span>
      <span class="faces">${uniqueStars(p).slice(0, 6).map(id => face(id, { size: 30, animated: false })).join('')}</span>
      <span class="row between">${pill(`${p.steps.length} stops`, fam.color)}${stars(store.pathwayStars(p.id), 3, 14)}</span>
    </span>
    <span class="chev" aria-hidden="true">›</span>
  </a>`;
}

export function rankCard() {
  const rank = store.rank;
  const next = store.nextRank;
  const total = store.totalStars;
  return `<div class="card row rank-card">
    <span class="rank-emoji">${rank.emoji}</span>
    <span class="grow">
      <b class="rank-title">${esc(rank.title)}</b>
      <span class="rank-stats"><span class="gold">★ ${total}/${store.maxStars}</span><span class="pinkish">☺ ${store.collectedCount}/${CAST.length} pals</span></span>
      ${next ? `${progress((total - rank.minStars) / Math.max(1, next.minStars - rank.minStars), '#FFC300')}
        <small>${next.minStars - total} more ⭐ to become ${esc(next.title)} ${next.emoji}</small>`
        : '<small>Top rank reached. You\'re a legend! 🎉</small>'}
    </span>
  </div>`;
}

/**
 * A multiple-choice question with instant feedback. `state` = { choices, picked } is kept by the caller
 * so the card survives re-renders. Buttons carry data-answer; the caller handles clicks.
 */
export function questionCard(q, state, title = '') {
  if (!state.choices) state.choices = shuffleChoices(q);
  const picked = state.picked;
  return `<div class="card question">
    ${title ? `<div class="eyebrow">${esc(title)}</div>` : ''}
    <p class="prompt">${esc(q.prompt)}</p>
    ${state.choices.map((choice, i) => {
      let cls = '';
      let icon = '';
      if (picked != null) {
        if (choice === q.correct) { cls = 'good'; icon = '✓'; } else if (choice === picked) { cls = 'bad'; icon = '✕'; } else cls = 'dim';
      }
      return `<button class="choice ${cls}" data-answer="${i}" ${picked != null ? 'disabled' : ''}><span>${esc(choice)}</span><b>${icon}</b></button>`;
    }).join('')}
    ${picked != null ? `<p class="feedback ${picked === q.correct ? 'good' : 'bad'}" role="status">${picked === q.correct ? 'Correct! ' : 'Not quite. '}${esc(q.explanation)}</p>` : ''}
  </div>`;
}

function shuffleChoices(q) {
  const a = [q.correct, ...q.wrong];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shared end-of-game summary with stars, score and key lessons. */
export function gameOver({ title, score, stars: count, isNewBest, lessons }) {
  if (count > 0) confetti();
  return `<div class="stack center game-over">
    <div class="big-emoji">${count >= 3 ? '🏆' : count === 2 ? '🎉' : '👍'}</div>
    <h1 class="display">${esc(title)}</h1>
    ${stars(count, 3, 34)}
    <p class="score-line">Score: ${score}</p>
    ${isNewBest ? pill('NEW BEST!') : ''}
    <div class="card left">${sectionHeader('What you learned', '💡')}
      <ul class="lessons">${lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>
    <div class="row gap buttons">
      <button class="bubble white" data-action="replay">↻ Play again</button>
      <a class="bubble" href="#play">Done</a>
    </div>
  </div>`;
}

export const nameOf = id => firstName(character(id));

// MARK: - Confetti

const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function confetti() {
  if (reduceMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#FF5C8A', '#FFC300', '#3A86FF', '#2DC653', '#9B5DE5', '#FF8C42', '#00BBF9'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const parts = Array.from({ length: 90 }, () => ({
    x: rnd(0.1, 0.9), vx: rnd(-0.25, 0.25), vy: rnd(-1.3, -0.6), size: rnd(7, 13),
    color: colors[Math.floor(Math.random() * colors.length)], spin: rnd(-8, 8), round: Math.random() < 0.5,
  }));
  const start = performance.now();
  const frame = now => {
    const t = (now - start) / 1000;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (t > 4 || !canvas.isConnected) { canvas.remove(); return; }
    for (const p of parts) {
      const x = (p.x + p.vx * t) * w;
      const y = h * (0.45 + p.vy * t + 0.75 * t * t);
      if (y > h + 20) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.spin * t);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.round) ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
      else ctx.rect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Wiggle an element once (the SwiftUI ShakeEffect). */
export function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

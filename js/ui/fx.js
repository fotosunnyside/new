// Moments: discovery reveals, reward reveals, toasts, confetti, sparkles and the ambient particle field.
import { character, FAMILY, CAST } from '../data.js';
import { store } from '../state/store.js';
import { esc, reduceMotion } from './dom.js';
import { pal } from './pal.js';
import { stars } from './components.js';
import { ICONS } from './art.js';

// MARK: - Overlay queue

const queue = [];
let showing = false;

/** Queue a full-screen moment. `build(close)` returns the overlay element's inner HTML and wiring. */
function enqueue(render) {
  queue.push(render);
  if (!showing) next();
}

function next() {
  const render = queue.shift();
  if (!render) { showing = false; return; }
  showing = true;
  const el = document.createElement('div');
  el.className = 'moment';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  const opener = document.activeElement;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    el.classList.add('leaving');
    setTimeout(() => {
      el.remove();
      document.removeEventListener('keydown', onKey);
      if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
      next();
    }, reduceMotion() ? 0 : 220);
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  render(el, close);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(el);
  el.querySelector('[data-close]')?.focus({ preventScroll: true });
}

export const isShowingMoment = () => showing;

// MARK: - Discovery

/** The "new Molecule Pal!" event: darken, glow, silhouette, particles, reveal. */
export function discover(id) {
  const c = character(id);
  const fam = FAMILY[c.family];
  enqueue((el, close) => {
    el.classList.add('discovery');
    el.style.setProperty('--c', c.color);
    el.setAttribute('aria-label', `New Molecule Pal: ${c.name}`);
    const count = store.collectedCount;
    el.innerHTML = `<div class="moment-card">
      <div class="reveal-stage">
        <span class="reveal-rays"></span><span class="reveal-glow"></span>
        <span class="reveal-sil">${pal(id, { size: 170, mystery: true, shadow: false })}</span>
        <span class="reveal-pal">${pal(id, { size: 170, excited: true })}</span>
        <span class="sparks">${Array.from({ length: 14 }, (_, i) => `<i style="--a:${i * 25.7}deg;--dl:${(i % 5) * 60}ms"></i>`).join('')}</span>
      </div>
      <p class="reveal-kicker">New Molecule Pal!</p>
      <h2 class="reveal-name">${esc(c.name)}</h2>
      <p class="reveal-mol">${esc(c.molecule)} · <span style="color:${fam.color}">${fam.emoji} ${fam.short}</span></p>
      <p class="reveal-fact">${esc(c.funFact)}</p>
      <p class="reveal-count">Collection <b data-count>${count - 1}</b> / ${CAST.length}</p>
      <div class="moment-actions"><a class="btn ghost" href="#pal-${id}" data-close>See card</a><button class="btn" data-close>Awesome!</button></div>
    </div>`;
    el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
    setTimeout(() => { const n = el.querySelector('[data-count]'); if (n) { n.textContent = count; n.classList.add('bump'); } }, reduceMotion() ? 0 : 1900);
  });
}

// MARK: - Rewards

/**
 * Reward moment after finishing something.
 * { title, stars, gained, score, isNewBest, lines, color }
 */
export function reward({ title, stars: count = 0, gained = 0, score, isNewBest, lines = [], color = 'var(--pink)', emoji = '🎉' }) {
  enqueue((el, close) => {
    el.classList.add('reward');
    el.style.setProperty('--c', color);
    el.setAttribute('aria-label', title);
    el.innerHTML = `<div class="moment-card">
      <div class="reward-emoji">${emoji}</div>
      <h2 class="reward-title">${esc(title)}</h2>
      ${stars(count, 3, 'big pop-stars')}
      ${gained > 0 ? `<p class="gain">+${gained} ${ICONS.star}</p>` : ''}
      ${score != null ? `<p class="reward-score">Score <b>${score}</b>${isNewBest ? ' <span class="chip" style="--c:var(--pink)">NEW BEST!</span>' : ''}</p>` : ''}
      ${lines.map(l => `<p class="reward-line">${esc(l)}</p>`).join('')}
      <div class="moment-actions"><button class="btn" data-close>Continue</button></div>
    </div>`;
    el.querySelector('[data-close]').addEventListener('click', close);
    if (count > 0) confetti();
  });
}

export function rankUp(rank) {
  enqueue((el, close) => {
    el.classList.add('reward', 'rank-up');
    el.setAttribute('aria-label', `New rank: ${rank.title}`);
    el.innerHTML = `<div class="moment-card">
      <p class="reveal-kicker">Rank up!</p>
      <div class="rank-medallion">${rank.emoji}</div>
      <h2 class="reward-title">${esc(rank.title)}</h2>
      <p class="reward-line">Keep exploring to unlock the next rank.</p>
      <div class="moment-actions"><button class="btn" data-close>Yes!</button></div>
    </div>`;
    el.querySelector('[data-close]').addEventListener('click', close);
    confetti();
  });
}

// MARK: - Toasts

export function toast(html) {
  let host = document.querySelector('.toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toasts';
    host.setAttribute('role', 'status');
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  host.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3200);
}

// MARK: - Confetti & sparkles

export function confetti() {
  if (reduceMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#FF5C8A', '#FFC83D', '#2EC5E8', '#5FD3A6', '#A78BFA', '#FF7A6B', '#7FE3F5'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const parts = Array.from({ length: 110 }, () => ({
    x: rnd(0.1, 0.9), vx: rnd(-0.3, 0.3), vy: rnd(-1.4, -0.6), size: rnd(7, 13),
    color: colors[Math.floor(Math.random() * colors.length)], spin: rnd(-8, 8), shape: Math.floor(rnd(0, 3)),
  }));
  const start = performance.now();
  const frame = now => {
    const t = (now - start) / 1000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (t > 3.6 || !canvas.isConnected) { canvas.remove(); return; }
    ctx.globalAlpha = Math.min(1, (3.6 - t) * 2);
    for (const p of parts) {
      const x = (p.x + p.vx * t) * w;
      const y = h * (0.5 + p.vy * t + 0.8 * t * t);
      if (y > h + 20) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.spin * t);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.shape === 0) ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
      else if (p.shape === 1) ctx.rect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; ctx.lineTo(Math.cos(a) * p.size / 2, Math.sin(a) * p.size / 2); ctx.lineTo(Math.cos(a + 0.628) * p.size / 5, Math.sin(a + 0.628) * p.size / 5); } }
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** A quick burst of sparkles at an element (a tap, a correct answer, a checkpoint). */
export function sparkle(target, color = '#FFC83D') {
  if (reduceMotion() || !target) return;
  const r = target.getBoundingClientRect();
  const host = document.createElement('div');
  host.className = 'burst';
  host.style.left = `${r.left + r.width / 2}px`;
  host.style.top = `${r.top + r.height / 2}px`;
  host.style.setProperty('--c', color);
  host.innerHTML = Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg"></i>`).join('');
  document.body.appendChild(host);
  setTimeout(() => host.remove(), 700);
}

// MARK: - Ambient particles

/** Soft glowing motes drifting upward behind everything. Paused when hidden or with reduced motion. */
export function ambient(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let raf = 0;
  const motes = Array.from({ length: 26 }, () => ({
    x: Math.random(), y: Math.random(), r: 2 + Math.random() * 7, s: 0.006 + Math.random() * 0.014,
    wob: Math.random() * 6.28, a: 0.25 + Math.random() * 0.4,
  }));
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = (t = 0) => {
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      const x = (m.x + Math.sin(t / 3000 + m.wob) * 0.02) * w;
      const y = m.y * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, m.r * 2.2);
      g.addColorStop(0, `rgba(255,255,255,${m.a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, m.r * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    for (const m of motes) {
      m.y -= m.s * dt * 2;
      if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
    }
    draw(now);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    cancelAnimationFrame(raf);
    if (reduceMotion() || document.hidden) { draw(); return; }
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  resize();
  addEventListener('resize', () => { resize(); draw(); });
  document.addEventListener('visibilitychange', start);
  start();
}

// App shell: header, navigation, routing, and turning progress changes into reward moments.
import { CAST } from './data.js';
import { store } from './state/store.js';
import { questStatus, undiscovered } from './state/progress.js';
import { esc, reduceMotion } from './ui/dom.js';
import { pal, SVG_DEFS } from './ui/pal.js';
import { ICONS } from './ui/art.js';
import { playerChip, counters } from './ui/components.js';
import { discover, toast, rankUp, ambient, confetti, sparkle } from './ui/fx.js';
import { bodyMap, place } from './screens/map.js';
import { pathwayList, adventureMap, stop, finish } from './screens/pathways.js';
import { collection, palProfile, meet } from './screens/pals.js';
import { arcade, profile } from './screens/play.js';
import { enzymeScissors, fatRouter, hormoneFactory, hormoneBuild, ribosomeRush, quiz } from './screens/games.js';

const TABS = [
  { id: 'map', label: 'Body Map', href: '#map' },
  { id: 'pathways', label: 'Pathways', href: '#pathways' },
  { id: 'pals', label: 'Molecule Pals', href: '#pals' },
  { id: 'play', label: 'Play', href: '#play' },
];

const main = document.getElementById('main');
const headerLeft = document.getElementById('header-left');
const titleEl = document.getElementById('title');
const counterEl = document.getElementById('counters');
const nav = document.getElementById('tabs');
let current = null;
let currentKey = '';

const app = {
  rerender(toTop = false) {
    if (!current) return;
    const y = window.scrollY;
    main.innerHTML = current.html();
    window.scrollTo(0, toTop ? 0 : y);
  },
};

// MARK: - Routing

function resolve(hash) {
  const [kind, ...rest] = hash.replace(/^#/, '').split('-');
  const arg = rest.join('-');
  switch (kind) {
    case '': case 'map': return bodyMap(app);
    case 'place': return place(app, arg);
    case 'pathways': return pathwayList(app);
    case 'pathway': return adventureMap(app, arg);
    case 'stop': return stop(app, arg);
    case 'finish': return finish(app, arg);
    case 'pals': return collection(app);
    case 'pal': return palProfile(app, arg);
    case 'meet': return meet(app, arg);
    case 'play': return arcade(app);
    case 'profile': return profile(app);
    case 'hormone': return hormoneBuild(app, arg);
    case 'game':
      return ({ scissors: enzymeScissors, fatRouter, factory: hormoneFactory, proteinBuilder: ribosomeRush, quiz })[arg]?.(app) ?? null;
    default: return null;
  }
}

function paintChrome() {
  const s = current;
  document.body.dataset.world = s.world || 'body';
  document.body.style.setProperty('--tint', s.tint || 'transparent');
  titleEl.textContent = s.title;
  headerLeft.innerHTML = s.back
    ? `<button class="icon-btn" data-back aria-label="Back">${ICONS.back}</button>`
    : playerChip();
  counterEl.innerHTML = counters();
  nav.querySelectorAll('a').forEach(a => a.setAttribute('aria-current', a.dataset.tab === (s.tab || 'map') ? 'page' : 'false'));
}

function route() {
  const key = location.hash || '#map';
  if (key === currentKey && current) return;
  const next = resolve(key);
  if (!next) { location.replace('#map'); return; }
  if (next.redirect) { location.replace(next.redirect); return; }
  current?.destroy?.();
  document.querySelectorAll('.confetti').forEach(c => c.remove());
  current = next;
  currentKey = key;
  document.title = `${next.title} · NutriQuest`;
  document.body.classList.remove('dive-out');
  current.mount?.();
  paintChrome();
  main.innerHTML = current.html();
  main.dataset.enter = current.enter || 'fade';
  main.classList.remove('entering');
  void main.offsetWidth;
  main.classList.add('entering');
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

main.addEventListener('animationend', e => { if (e.target === main) main.classList.remove('entering'); });

// MARK: - Events

main.addEventListener('click', e => {
  const answer = e.target.closest('[data-answer]');
  if (answer && current?.answer) { current.answer(+answer.dataset.answer, answer); return; }
  const replaceLink = e.target.closest('a[data-replace]');
  if (replaceLink) { e.preventDefault(); location.replace(replaceLink.getAttribute('href')); return; }
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  if (el.dataset.action === 'claim-chest') { claimChest(el); return; }
  current?.action?.(el.dataset.action, el, e);
});

document.querySelector('.appbar').addEventListener('click', e => {
  if (!e.target.closest('[data-back]')) return;
  const back = current?.back;
  if (back === 'history') {
    if (history.length > 1) history.back(); else location.hash = '#map';
  } else location.hash = back || '#map';
});

function claimChest(el) {
  if (!questStatus().ready) return;
  sparkle(el, '#FFC83D');
  store.claimChest();
  const hidden = undiscovered();
  if (hidden.length) store.collect(hidden[Math.floor(Math.random() * hidden.length)].id);
  else { confetti(); toast('<b>Treasure!</b> You have already found every pal. Legend!'); }
  app.rerender();
}

// MARK: - Progress → moments

let snap = null;
const snapshot = () => ({
  stars: store.totalStars, pals: CAST.filter(c => store.isCollected(c.id)).map(c => c.id),
  rank: store.rank.title, badges: store.badges.filter(b => b.earned).map(b => b.title), quests: questStatus().done,
});

let pending = false;
store.onChange(() => {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    const now = snapshot();
    const was = snap;
    snap = now;
    if (current) paintChrome();
    if (!was) return;
    if (now.stars > was.stars) bump('stars');
    const fresh = now.pals.filter(id => !was.pals.includes(id));
    if (fresh.length) bump('pals');
    // Pals are revealed in the order you meet them; a big haul (a hormone chain) shows each one.
    fresh.sort((a, b) => store.collectedIndex(a) - store.collectedIndex(b)).forEach(id => discover(id));
    now.badges.filter(b => !was.badges.includes(b)).forEach(title => {
      const b = store.badges.find(x => x.title === title);
      toast(`<span class="toast-emoji">${b.emoji}</span><span><b>Badge unlocked!</b> ${esc(b.title)}</span>`);
    });
    if (now.rank !== was.rank && now.stars > was.stars) rankUp(store.rank);
    if (now.quests > was.quests) {
      const q = questStatus();
      toast(`<span class="toast-emoji">✔</span><span><b>Quest complete!</b> ${q.done}/${q.total}${q.ready ? ' · Treasure ready!' : ''}</span>`);
    }
  });
});

function bump(which) {
  const el = counterEl.querySelector(`[data-counter="${which}"]`);
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// MARK: - Onboarding

const ONBOARDING = [
  { faces: ['mito'], title: "Hi! I'm Dr. Mito!",
    text: "I'm a mitochondrion, the powerhouse inside your cells. I'll be your guide on a journey through the body!" },
  { faces: ['starch', 'lct', 'protein', 'iron'], title: 'Every bite is an adventure',
    text: 'Carbs, fats, proteins, vitamins and minerals get snipped, carried and rebuilt into the energy, hormones and body parts you need.' },
  { faces: ['serotonin', 'insulin', 't3', 'adrenaline'], title: 'Food becomes YOU',
    text: 'Explore the Body World, follow Adventures, collect Molecule Pals and play in the Arcade to earn stars. Let\'s go!' },
];

function showOnboarding() {
  let page = 0;
  const el = document.createElement('div');
  el.className = 'onboarding';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Welcome to NutriQuest');
  const draw = () => {
    const pg = ONBOARDING[page];
    el.innerHTML = `<div class="onboard-inner">
      <div class="faces-row">${pg.faces.map(id => pal(id, { size: pg.faces.length === 1 ? 180 : 88, excited: true })).join('')}</div>
      <h1 class="display lg">${esc(pg.title)}</h1><p class="lead">${esc(pg.text)}</p>
      <div class="dots" aria-hidden="true">${ONBOARDING.map((_, i) => `<span class="${i === page ? 'on' : ''}"></span>`).join('')}</div>
      <button class="btn big wide" data-onboard>${page < ONBOARDING.length - 1 ? 'Next' : "Let's go!"}</button>
      ${page < ONBOARDING.length - 1 ? '<button class="text-btn" data-skip>Skip</button>' : ''}
    </div>`;
    el.querySelector('[data-onboard]').focus();
  };
  el.addEventListener('click', e => {
    if (e.target.closest('[data-skip]') || (e.target.closest('[data-onboard]') && page === ONBOARDING.length - 1)) {
      store.finishOnboarding();
      el.remove();
    } else if (e.target.closest('[data-onboard]')) {
      page++;
      draw();
    }
  });
  document.body.appendChild(el);
  draw();
}

// MARK: - Boot

nav.innerHTML = TABS.map(t => `<a href="${t.href}" data-tab="${t.id}"><span class="nav-icon">${ICONS[t.id]}</span><span class="nav-label">${t.label}</span></a>`).join('');
document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
ambient(document.getElementById('ambient'));
snap = snapshot();
window.addEventListener('hashchange', route);
route();
if (!store.hasOnboarded) showOnboarding();
if (reduceMotion()) document.documentElement.classList.add('reduced-motion');

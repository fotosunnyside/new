// App shell: tabs, hash routing and the main screens (Views/*.swift).
import {
  FAMILIES, FAMILY, LOCATIONS, LOCATION, CAST, character, firstName, PATHWAYS, pathway as findPathway,
  uniqueStars, pathwaysFeaturing, pathwaysVisiting, GAMES, RECIPES,
} from './data.js';
import { store } from './store.js';
import {
  esc, face, stars, pill, progress, sectionHeader, tags, helperChips, transformationChain, pathwayCard,
  rankCard, questionCard, confetti, SVG_DEFS,
} from './ui.js';
import { enzymeScissors, fatRouter, hormoneFactory, hormoneBuild, ribosomeRush, quiz } from './games.js';

const TABS = [
  { id: 'map', label: 'Body Map', icon: '🧍' },
  { id: 'pathways', label: 'Pathways', icon: '🧭' },
  { id: 'pals', label: 'Molecule Pals', icon: '☺' },
  { id: 'play', label: 'Play', icon: '🎮' },
];

// MARK: - Screens

function bodyMap() {
  const mapped = LOCATIONS.filter(l => l.map);
  const inside = LOCATIONS.filter(l => !l.map);
  return {
    tab: 'map', title: 'NutriQuest', bg: 'sky',
    html: () => `<div class="stack">
      ${rankCard()}
      <p class="lead center">Tap a glowing spot to explore what happens there!</p>
      <div class="body-figure">
        <svg viewBox="0 0 100 160" aria-hidden="true">
          <defs><linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3D3"/><stop offset="1" stop-color="#FFC9B9"/></linearGradient></defs>
          <g fill="url(#skin)" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" paint-order="stroke">
            <rect x="31" y="90" width="17" height="66" rx="8"/><rect x="52" y="90" width="17" height="66" rx="8"/>
            <rect x="-6" y="0" width="12" height="58" rx="6" transform="translate(31 38) rotate(10.3)"/>
            <rect x="-6" y="0" width="12" height="58" rx="6" transform="translate(69 38) rotate(-10.3)"/>
            <rect x="28" y="33" width="44" height="64" rx="14"/>
            <rect x="44" y="26" width="12" height="10" rx="4"/>
            <circle cx="50" cy="16" r="13"/>
          </g>
        </svg>
        ${mapped.map((l, i) => `<a class="station" href="#place-${l.id}" aria-label="${esc(l.name)}"
          style="left:${l.map[0]}%;top:${l.map[1] / 1.6}%;--c:${l.color};--d:${(-i * 0.13 / 0.7).toFixed(2)}s"><span>${l.emoji}</span></a>`).join('')}
      </div>
      <div class="card">${sectionHeader('Zoom inside a cell', '🔬')}
        <div class="grid two">${inside.map(l => `<a class="place-tile" href="#place-${l.id}" style="--c:${l.color}">
          <span class="big">${l.emoji}</span><b>${esc(l.name)}</b></a>`).join('')}</div></div>
      <div class="card">${sectionHeader('All the places', '📍')}
        <div class="flow">${mapped.map(l => `<a class="tag link" href="#place-${l.id}" style="--c:${l.color}">${l.emoji} ${esc(l.name)}</a>`).join('')}</div></div>
    </div>`,
  };
}

function place(id) {
  const loc = LOCATION[id];
  if (!loc) return null;
  const paths = pathwaysVisiting(id);
  const seen = new Set();
  const chars = [];
  for (const p of paths) for (const st of p.steps) {
    if (st.location === id && !seen.has(st.star)) { seen.add(st.star); chars.push(st.star); }
  }
  return {
    tab: 'map', title: loc.name, back: '#map', bg: 'tint', tint: loc.color,
    html: () => `<div class="stack">
      <div class="row gap"><span class="place-emoji" style="--c:${loc.color}">${loc.emoji}</span><h1 class="display">${esc(loc.name)}</h1></div>
      <p class="body-text">${esc(loc.blurb)}</p>
      ${chars.length ? `${sectionHeader('Molecules spotted here', '👀')}
        <div class="scroller">${chars.map(c => `<a class="mini-pal" href="#pal-${c}">${face(c, { size: 62 })}<span>${esc(firstName(character(c)))}</span></a>`).join('')}</div>` : ''}
      ${paths.length ? `${sectionHeader('Journeys that stop here', '🧭')}${paths.map(pathwayCard).join('')}` : ''}
    </div>`,
  };
}

function pathwayList() {
  return {
    tab: 'pathways', title: 'Pathways', bg: 'candy',
    html: () => `<div class="stack">
      <p class="lead">Follow a molecule's journey through your body, one stop at a time!</p>
      ${FAMILIES.map(f => {
        const items = PATHWAYS.filter(p => p.family === f.id);
        return items.length ? `${sectionHeader(f.title, f.emoji)}${items.map(pathwayCard).join('')}` : '';
      }).join('')}
    </div>`,
  };
}

// Players are kept for the session so meeting a helper pal and coming back resumes the journey.
const players = new Map();

function pathwayPlayer(app, id) {
  const p = findPathway(id);
  if (!p) return null;
  if (players.has(id)) return players.get(id);
  const fam = FAMILY[p.family];
  const s = { index: 0, finished: false, overview: false, card: {} };
  const collectStar = () => store.collect(p.steps[s.index].star);

  const screen = {
    tab: 'pathways', title: p.title, back: '#pathways', bg: 'tint',
    get tint() { return s.finished ? fam.color : LOCATION[p.steps[s.index].location].color; },
    mount() { collectStar(); },
    html() {
      if (s.overview) {
        return `<div class="stack"><h1 class="display sm">Pathway map</h1><ol class="overview">${p.steps.map((st, i) => {
          const loc = LOCATION[st.location];
          return `<li><button class="card row" data-action="jump" data-i="${i}">${face(st.star, { size: 44, animated: false })}
            <span class="grow"><b>${i + 1}. ${esc(st.title)}</b><small class="muted">${loc.emoji} ${esc(loc.name)} · ${esc(firstName(character(st.star)))}</small></span>
            ${i === s.index && !s.finished ? `<span style="color:${fam.color}" aria-label="You are here">📍</span>` : ''}</button></li>`;
        }).join('')}</ol><button class="bubble white" data-action="overview">Close map</button></div>`;
      }
      if (s.finished) {
        return `<div class="stack center">
          <div class="big-emoji">🎉</div><h1 class="display">Pathway complete!</h1>${stars(store.pathwayStars(p.id), 3, 30)}
          <div class="card left">${sectionHeader('The transformation', '✨')}${transformationChain(uniqueStars(p))}</div>
          ${questionCard(p.check, s.card, '⭐ Bonus star question')}
          <div class="row gap buttons"><button class="bubble white" data-action="restart">↻ Replay</button>
            <a class="bubble" style="--b:${fam.color}" href="#pathways">Done</a></div>
        </div>`;
      }
      const st = p.steps[s.index];
      const star = character(st.star);
      const loc = LOCATION[st.location];
      const last = s.index === p.steps.length - 1;
      const nextLabel = last ? 'Finish! 🏁' : p.steps[s.index + 1].star === st.star ? 'Next stop →' : 'Transform! →';
      return `<div class="stack player">
        <div class="row between"><span class="eyebrow">Stop ${s.index + 1} of ${p.steps.length}</span>
          <span class="row gap-s"><span class="loc-pill" style="background:${loc.color}">📍 ${loc.emoji} ${esc(loc.name)}</span>
          <button class="icon-btn" data-action="overview" aria-label="Pathway map">🗺️</button></span></div>
        ${progress((s.index + 1) / p.steps.length, fam.color)}
        <div class="center stack-s star pop">${face(st.star, { size: 150, excited: true })}
          <h1 class="display">${esc(star.name)}</h1><span class="muted strong">${esc(star.molecule)}</span></div>
        <div class="bubble-speech slide"><h2 class="display xs">${esc(st.title)}</h2><p class="body-text">${esc(st.text)}</p></div>
        ${st.helpers.length ? helperChips(st.helpers) : ''}
        <div class="controls">
          <button class="bubble white" data-action="prev" ${s.index === 0 ? 'disabled' : ''} aria-label="Previous stop">‹</button>
          <button class="bubble grow" style="--b:${fam.color}" data-action="next">${nextLabel}</button>
        </div>
      </div>`;
    },
    answer(i) {
      if (s.card.picked != null) return;
      s.card.picked = s.card.choices[i];
      if (s.card.picked === p.check.correct) { store.awardPathway(p.id, 3); confetti(); }
      app.rerender();
    },
    action(name, el) {
      if (name === 'next') {
        if (s.index + 1 >= p.steps.length) {
          s.finished = true;
          store.awardPathway(p.id, 2);
          confetti();
        } else {
          s.index++;
          collectStar();
        }
      } else if (name === 'prev') {
        s.index = Math.max(0, s.index - 1);
      } else if (name === 'restart') {
        Object.assign(s, { index: 0, finished: false, card: {} });
      } else if (name === 'overview') {
        s.overview = !s.overview;
      } else if (name === 'jump') {
        Object.assign(s, { index: +el.dataset.i, finished: false, overview: false });
        collectStar();
      }
      app.rerender(true);
    },
  };
  players.set(id, screen);
  return screen;
}

function gallery(app) {
  let filter = null;
  return {
    tab: 'pals', title: 'Molecule Pals', bg: 'mint',
    html() {
      const shown = filter ? CAST.filter(c => c.family === filter) : CAST;
      const count = store.collectedCount;
      const chip = (id, label, emoji, color) =>
        `<button class="filter${filter === id ? ' on' : ''}" style="--c:${color}" data-action="filter" data-id="${id ?? ''}" aria-pressed="${filter === id}">${emoji} ${label}</button>`;
      return `<div class="stack">
        <div class="card stack-s"><div class="row between"><b class="muted">Collected</b><b class="count">${count} / ${CAST.length}</b></div>
          ${progress(count / CAST.length)}<small class="muted">Meet molecules in Pathways, or tap a mystery card to discover it!</small></div>
        <div class="scroller filters">${chip(null, 'All', '🌈', 'var(--ink)')}${FAMILIES.map(f => chip(f.id, f.short, f.emoji, f.color)).join('')}</div>
        <div class="grid pals">${shown.map(c => {
          const got = store.isCollected(c.id);
          const fam = FAMILY[c.family];
          return `<a class="tile pal-tile${got ? ' got' : ''}" href="#pal-${c.id}" style="--c:${fam.color}">
            ${face(c.id, { size: 64, animated: got, silhouette: !got })}
            <b>${got ? esc(firstName(c)) : '???'}</b><small style="color:${got ? fam.color : 'var(--soft-ink)'}">${got ? fam.short : 'Tap to discover'}</small></a>`;
        }).join('')}</div>
      </div>`;
    },
    action(name, el) {
      if (name === 'filter') { filter = el.dataset.id || null; app.rerender(); }
    },
  };
}

function palDetail(id) {
  const c = CAST.find(x => x.id === id);
  if (!c) return null;
  const fam = FAMILY[c.family];
  let fresh = false;
  return {
    tab: 'pals', title: firstName(c), back: 'history', bg: 'tint', tint: c.color,
    mount() { if (store.collect(c.id)) { fresh = true; confetti(); } },
    html() {
      const paths = pathwaysFeaturing(c.id);
      const info = (title, emoji, body) => `<div class="card">${sectionHeader(title, emoji)}${body}</div>`;
      return `<div class="stack">
        <div class="center stack-s">${fresh ? pill('✨ NEW PAL DISCOVERED! ✨') : ''}
          ${face(c.id, { size: 160, excited: true })}
          <h1 class="display">${esc(c.name)}</h1><span class="muted strong">${esc(c.molecule)}</span>
          ${pill(`${fam.emoji} ${fam.title}`, fam.color)}</div>
        <div class="bubble-speech"><p class="catchphrase">“${esc(c.catchphrase)}”</p></div>
        ${info('About me', '📖', `<p class="body-text">${esc(c.bio)}</p>`)}
        ${info('Where to find me', '🍽️', tags(c.foods, '#FFF1C1'))}
        ${info('What I can become', '🔄', tags(c.becomes, `color-mix(in srgb, ${c.color} 18%, white)`))}
        ${info('Fun fact', '🤯', `<p class="body-text strong">${esc(c.funFact)}</p>`)}
        ${paths.length ? `${sectionHeader('Follow my journeys', '🧭')}${paths.map(pathwayCard).join('')}` : ''}
      </div>`;
    },
  };
}

function playHub(app) {
  let confirming = false;
  return {
    tab: 'play', title: 'Play', bg: 'sunset',
    html() {
      return `<div class="stack">
        ${rankCard()}
        ${GAMES.map(g => {
          let meta;
          if (g.id === 'factory') {
            const built = RECIPES.filter(r => store.hormoneStars(r.id) > 0).length;
            meta = pill(`${built}/${RECIPES.length} built`, g.color);
          } else {
            const best = store.bestScore(g.id);
            meta = `${stars(store.gameStars(g.id), 3, 14)}${best !== undefined ? `<small class="muted strong">Best: ${best}</small>` : ''}`;
          }
          return `<a class="card row game-card" href="#game-${g.id}">${face(g.mascot, { size: 70, excited: true })}
            <span class="grow"><b class="title">${esc(g.title)}</b><span class="sub">${esc(g.subtitle)}</span><span class="row gap-s">${meta}</span></span>
            <span class="play-btn" style="background:${g.color}" aria-hidden="true">▶</span></a>`;
        }).join('')}
        <div class="card">${sectionHeader('Badges', '🏅')}
          <div class="grid badges">${store.badges.map(b => `<div class="badge${b.earned ? ' earned' : ''}">
            <span class="badge-emoji">${b.emoji}</span><b>${esc(b.title)}</b><small>${esc(b.detail)}</small>
            <span class="sr">${b.earned ? 'Earned' : 'Not earned yet'}</span></div>`).join('')}</div></div>
        <div class="reset">${confirming
          ? `<p class="strong">Reset all stars, scores and collected pals?</p>
             <div class="row gap"><button class="bubble danger" data-action="reset-yes">Reset everything</button>
             <button class="bubble white" data-action="reset-no">Cancel</button></div>`
          : '<button class="text-btn" data-action="reset">Reset all progress</button>'}</div>
      </div>`;
    },
    action(name) {
      if (name === 'reset') confirming = true;
      if (name === 'reset-no') confirming = false;
      if (name === 'reset-yes') { store.reset(); players.clear(); confirming = false; }
      app.rerender();
    },
  };
}

// MARK: - Onboarding

const ONBOARDING = [
  { faces: ['mito'], title: "Hi! I'm Dr. Mito!",
    text: "I'm a mitochondrion, the powerhouse inside your cells. I'll be your guide on a journey through the body!" },
  { faces: ['starch', 'lct', 'protein', 'iron'], title: 'Every bite is an adventure',
    text: 'Carbs, fats, proteins, vitamins and minerals get snipped, carried and rebuilt into the energy, hormones and body parts you need.' },
  { faces: ['serotonin', 'insulin', 't3', 'adrenaline'], title: 'Food becomes YOU',
    text: "Explore the Body Map, follow Pathways, collect Molecule Pals and play games to earn stars. Let's go!" },
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
    el.innerHTML = `<div class="onboard-inner stack center">
      <div class="faces-row">${pg.faces.map(id => face(id, { size: pg.faces.length === 1 ? 170 : 86, excited: true })).join('')}</div>
      <h1 class="display lg">${esc(pg.title)}</h1><p class="lead">${esc(pg.text)}</p>
      <div class="dots" aria-hidden="true">${ONBOARDING.map((_, i) => `<span class="${i === page ? 'on' : ''}"></span>`).join('')}</div>
      <button class="bubble wide" data-onboard>${page < ONBOARDING.length - 1 ? 'Next' : "Let's go!"}</button>
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

// MARK: - Router

const main = document.getElementById('main');
const titleEl = document.getElementById('title');
const backEl = document.getElementById('back');
const nav = document.getElementById('tabs');
let current = null;
let currentKey = '';

const app = {
  rerender(toTop = false) {
    if (!current) return;
    const y = window.scrollY;
    paint();
    window.scrollTo(0, toTop ? 0 : y);
  },
};

function resolve(hash) {
  const [kind, ...rest] = hash.replace(/^#/, '').split('-');
  const arg = rest.join('-');
  switch (kind) {
    case '': case 'map': return bodyMap();
    case 'place': return place(arg);
    case 'pathways': return pathwayList();
    case 'pathway': return pathwayPlayer(app, arg);
    case 'pals': return gallery(app);
    case 'pal': return palDetail(arg);
    case 'play': return playHub(app);
    case 'hormone': return hormoneBuild(app, arg);
    case 'game':
      return ({ scissors: enzymeScissors, fatRouter, factory: hormoneFactory, proteinBuilder: ribosomeRush, quiz })[arg]?.(app) ?? null;
    default: return null;
  }
}

function paint() {
  const s = current;
  document.body.dataset.bg = s.bg || 'sky';
  document.body.style.setProperty('--tint', s.tint || 'transparent');
  titleEl.textContent = s.title;
  backEl.hidden = !s.back;
  const tab = s.tab || 'play';
  nav.querySelectorAll('a').forEach(a => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'));
  main.innerHTML = s.html();
}

function route() {
  const key = location.hash || '#map';
  if (key === currentKey && current) return;
  current?.destroy?.();
  document.querySelectorAll('.confetti').forEach(c => c.remove());
  const next = resolve(key);
  if (!next) { location.replace('#map'); return; }
  current = next;
  currentKey = key;
  document.title = next.title === 'NutriQuest' ? 'NutriQuest' : `${next.title} · NutriQuest`;
  current.mount?.();
  paint();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

main.addEventListener('click', e => {
  const answer = e.target.closest('[data-answer]');
  if (answer && current?.answer) { current.answer(+answer.dataset.answer); return; }
  const el = e.target.closest('[data-action]');
  if (el && current?.action && !el.disabled) current.action(el.dataset.action, el);
});

backEl.addEventListener('click', () => {
  if (current?.back === 'history') {
    if (history.length > 1) history.back(); else location.hash = '#pals';
  } else if (!current?.back) history.back();
  else location.hash = current.back;
});

nav.innerHTML = TABS.map(t => `<a href="#${t.id}" data-tab="${t.id}"><span aria-hidden="true">${t.icon}</span>${t.label}</a>`).join('');
document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
window.addEventListener('hashchange', route);
route();
if (!store.hasOnboarded) showOnboarding();

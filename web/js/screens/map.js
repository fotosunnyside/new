// Body Map: the world. Organs glow with their discovery state; tapping one dives into it.
import { LOCATIONS, LOCATION, character } from '../data.js';
import { store } from '../state/store.js';
import { organState, palsAt, nextAdventure, journey, stopsAt } from '../state/progress.js';
import { esc, reduceMotion } from '../ui/dom.js';
import { pal } from '../ui/pal.js';
import { bodyWorld, cellArt, organCloseup, TRAVEL_PATHS } from '../ui/art.js';
import { progressRing, questCard, adventureTile, palCard, mysteryCard, sectionTitle, chip } from '../ui/components.js';
import { toast } from '../ui/fx.js';

const STATE_LABEL = {
  undiscovered: 'Not discovered yet', available: 'Ready to explore', inProgress: 'Exploring', mastered: 'Mastered',
};

function hotspot(l, { cell = false } = {}) {
  const s = organState(l.id);
  const known = s.state !== 'undiscovered';
  const [x, y] = cell ? CELL_SPOTS[l.id] : [l.map[0] / 2, l.map[1] / 3.2];
  return `<button class="hotspot s-${s.state}" data-action="dive" data-loc="${l.id}" style="left:${x}%;top:${y}%;--c:${l.color}"
      aria-label="${esc(known ? l.name : 'Unknown place')}: ${STATE_LABEL[s.state]}${s.total ? `, ${s.seen} of ${s.total} stops` : ''}">
    <span class="hs-orb">${s.state === 'inProgress' ? progressRing(s.progress, { size: 40, stroke: 3.5, color: l.color, track: 'rgba(255,255,255,.6)' }) : ''}
      <span class="hs-core">${known ? l.emoji : '?'}</span></span>
    ${s.state === 'mastered' ? '<span class="hs-crown" aria-hidden="true">★</span>' : ''}
    ${known ? `<span class="hs-label">${esc(l.name)}</span>` : ''}
  </button>`;
}

const CELL_SPOTS = { cell: [41, 46], mitochondria: [69, 62] };

function travelers() {
  if (reduceMotion()) return '';
  // Known pals ride as themselves; unknown ones are soft sparks of light, a hint of something to find.
  const rider = (id, path, dur, delay) => {
    const body = store.isCollected(id)
      ? `<g transform="translate(-8 -9)">${pal(id, { size: 16, still: true, shadow: false })}</g>`
      : '<circle r="5.5" fill="#fff" opacity=".7" filter="url(#nq-glow)"/><circle r="2.6" fill="#fff"/>';
    return `<g class="traveler"><animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" path="${path}" calcMode="linear"/>${body}</g>`;
  };
  return rider('starch', TRAVEL_PATHS.food, 11, 0) + rider('glucose', TRAVEL_PATHS.blood, 14, -4) + rider('oxygen', TRAVEL_PATHS.blood, 14, -11);
}

export function bodyMap(app) {
  const onBody = LOCATIONS.filter(l => l.map);
  const inCell = LOCATIONS.filter(l => !l.map);
  return {
    tab: 'map', world: 'body', title: 'NutriQuest', home: true,
    html() {
      const states = Object.fromEntries(LOCATIONS.map(l => [l.id, organState(l.id).state]));
      const found = LOCATIONS.filter(l => states[l.id] === 'mastered').length;
      const next = nextAdventure();
      return `<div class="map-layout">
        <section class="world-stage" aria-label="Body map">
          <div class="world-intro rise">
            <h1 class="display">Your Body World</h1>
            <p>Tap a glowing place to dive in. ${found}/${LOCATIONS.length} places mastered.</p>
          </div>
          <div class="body-stage rise" data-stage>
            ${bodyWorld({ states, travelers: travelers() })}
            ${onBody.map(l => hotspot(l)).join('')}
          </div>
          <ul class="legend" aria-label="Map key">
            <li><i class="lg s-undiscovered"></i>Hidden</li><li><i class="lg s-available"></i>Ready</li>
            <li><i class="lg s-inProgress"></i>Exploring</li><li><i class="lg s-mastered"></i>Mastered</li>
          </ul>
        </section>
        <aside class="map-side">
          ${questCard({ compact: true })}
          ${next ? `<section class="next-up rise">${sectionTitle(journey(next).started ? 'Continue your adventure' : 'Your next adventure')}${adventureTile(next, { hero: true })}</section>` : ''}
          <section class="cell-portal glass rise">
            ${sectionTitle('Zoom inside a cell', '<span class="eyebrow">Microscope</span>')}
            <div class="cell-stage" data-stage>${cellArt()}${inCell.map(l => hotspot(l, { cell: true })).join('')}</div>
          </section>
        </aside>
      </div>`;
    },
    action(name, el) {
      if (name !== 'dive') return;
      const loc = el.dataset.loc;
      const go = () => { location.hash = `#place-${loc}`; };
      if (reduceMotion()) return go();
      const stage = el.closest('[data-stage]');
      el.classList.add('selected');
      stage.querySelector(`[data-organ="${loc}"]`)?.classList.add('focus');
      stage.style.transformOrigin = `${el.style.left} ${el.style.top}`;
      stage.classList.add('diving');
      document.body.classList.add('dive-out');
      setTimeout(go, 460);
    },
  };
}

export function place(app, id) {
  const loc = LOCATION[id];
  if (!loc) return null;
  let wasNew = false;
  return {
    tab: 'map', world: 'tint', tint: loc.color, title: loc.name, back: '#map', enter: 'dive',
    mount() {
      wasNew = organState(id).state === 'undiscovered';
      store.visit(id);
      if (wasNew) toast(`<b>New place discovered!</b> ${loc.emoji} ${esc(loc.name)}`);
    },
    html() {
      const s = organState(id);
      const pals = palsAt(id);
      const adventures = [...new Set(stopsAt(id).map(x => x.p))];
      const floaters = pals.slice(0, 6).map((pid, i) => {
        const a = (i / Math.max(1, Math.min(6, pals.length))) * Math.PI * 2 - Math.PI / 2;
        const known = store.isCollected(pid);
        return `<a class="floater" href="#pal-${pid}" style="left:${50 + Math.cos(a) * 38}%;top:${50 + Math.sin(a) * 36}%;--dl:${-i * 0.7}s"
          aria-label="${esc(known ? character(pid).name : 'Mystery pal')}">${pal(pid, { size: 54, mystery: !known, shadow: false })}</a>`;
      }).join('');
      return `<div class="stack">
        <section class="place-hero" style="--c:${loc.color}">
          <div class="place-art">${organCloseup(id)}</div>
          <div class="place-floaters">${floaters}</div>
          <div class="place-title">
            <span class="eyebrow">You're exploring</span>
            <h1 class="display">${loc.emoji} ${esc(loc.name)}</h1>
            <span class="place-state">${chip(STATE_LABEL[s.state], loc.color)}${s.total ? `<span>${s.seen}/${s.total} stops explored</span>` : ''}</span>
          </div>
        </section>
        <p class="glass lore">${esc(loc.blurb)}</p>
        ${adventures.length ? `${sectionTitle('Adventures that stop here')}<div class="tile-grid">${adventures.map(p => adventureTile(p)).join('')}</div>` : ''}
        ${pals.length ? `${sectionTitle('Pals found here', `<span class="eyebrow">${pals.filter(p => store.isCollected(p)).length}/${pals.length} found</span>`)}
          <div class="card-grid">${pals.map(pid => (store.isCollected(pid) ? palCard(character(pid)) : mysteryCard(character(pid)))).join('')}</div>` : ''}
      </div>`;
    },
  };
}

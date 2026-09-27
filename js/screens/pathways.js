// Pathways as adventures: a list of worlds, a winding route map, the stops themselves and the finish line.
import { FAMILIES, FAMILY, LOCATION, PATHWAYS, character, firstName, pathway as findPathway, uniqueStars } from '../data.js';
import { store } from '../state/store.js';
import { journey, nextAdventure } from '../state/progress.js';
import { esc } from '../ui/dom.js';
import { pal } from '../ui/pal.js';
import { ICONS, organCloseup } from '../ui/art.js';
import {
  adventureTile, stars, bar, sectionTitle, helperChips, transformationChain, questionCard, routeStrip, chip,
} from '../ui/components.js';
import { reward, sparkle } from '../ui/fx.js';

export function pathwayList() {
  return {
    tab: 'pathways', world: 'journey', title: 'Adventures',
    html() {
      const next = nextAdventure();
      const done = PATHWAYS.filter(p => journey(p).done).length;
      return `<div class="stack">
        <header class="screen-head rise"><h1 class="display">Adventures</h1>
          <p>Follow a molecule's journey through your body, one stop at a time. ${done}/${PATHWAYS.length} complete.</p></header>
        ${next ? `<section class="rise">${sectionTitle(journey(next).started ? 'Continue your adventure' : 'Start here')}${adventureTile(next, { hero: true })}</section>` : ''}
        ${FAMILIES.map(f => {
          const items = PATHWAYS.filter(p => p.family === f.id);
          if (!items.length) return '';
          const finished = items.filter(p => journey(p).done).length;
          return `<section class="world-group" style="--c:${f.color}">
            ${sectionTitle(`${f.emoji} ${f.title}`, `<span class="eyebrow">${finished}/${items.length} complete</span>`)}
            <div class="tile-grid">${items.map(p => adventureTile(p)).join('')}</div></section>`;
        }).join('')}
      </div>`;
    },
  };
}

// MARK: - Adventure map

const ROW = 158;
const xAt = i => 50 + 27 * Math.sin(i * 1.15 + 0.9);

export function adventureMap(app, id) {
  const p = findPathway(id);
  if (!p) return null;
  const fam = FAMILY[p.family];
  return {
    tab: 'pathways', world: 'journey', title: p.title, back: '#pathways',
    html() {
      const j = journey(p);
      const n = p.steps.length;
      const pts = p.steps.map((_, i) => [xAt(i), 70 + i * ROW]);
      const endY = 70 + n * ROW;
      pts.push([50, endY]);
      const height = endY + 90;
      const seg = (a, b) => `C${a[0]} ${a[1] + ROW / 2} ${b[0]} ${b[1] - ROW / 2} ${b[0]} ${b[1]}`;
      const full = `M${pts[0][0]} ${pts[0][1]}${pts.slice(1).map((b, i) => seg(pts[i], b)).join('')}`;
      const upto = j.done ? n : j.current;
      const lit = upto > 0 ? `M${pts[0][0]} ${pts[0][1]}${pts.slice(1, upto + 1).map((b, i) => seg(pts[i], b)).join('')}` : '';

      // Background bands: one per run of stops in the same place.
      const bands = [];
      p.steps.forEach((st, i) => {
        const last = bands[bands.length - 1];
        if (last && last.loc === st.location) last.to = i; else bands.push({ loc: st.location, from: i, to: i });
      });
      let mysteryTagged = false;
      const nodes = p.steps.map((st, i) => {
        const [x, y] = pts[i];
        const known = store.isCollected(st.star);
        const state = j.done || i < j.current ? 'done' : i === j.current ? 'current' : 'locked';
        let tag = '';
        if (state === 'locked' && !known && !mysteryTagged) { tag = '<span class="cp-tag">Mystery Pal ahead!</span>'; mysteryTagged = true; }
        if (state === 'current') tag = `<span class="cp-tag here">${j.started ? 'You are here' : 'Start here'}</span>`;
        const orb = state === 'locked'
          ? `${pal(st.star, { size: 50, still: true, shadow: false, mystery: true })}<span class="cp-lock">${ICONS.lock}</span>`
          : pal(st.star, { size: 52, still: state !== 'current', shadow: false, mystery: !known, excited: state === 'current' });
        const label = state === 'locked' ? `${LOCATION[st.location].emoji} ???` : `${i + 1}. ${esc(st.title)}`;
        const inner = `<span class="cp-orb">${orb}</span>${state === 'done' ? `<span class="cp-star">${ICONS.star}</span>` : ''}${tag}<span class="cp-label">${label}</span>`;
        const style = `left:${x}%;top:${y}px`;
        return state === 'locked'
          ? `<div class="cp s-locked" style="${style}" aria-label="Stop ${i + 1}: locked">${inner}</div>`
          : `<a class="cp s-${state}" href="#stop-${p.id}.${i}" style="${style}" aria-label="Stop ${i + 1}: ${esc(st.title)}${state === 'done' ? ', complete' : ', play now'}">${inner}</a>`;
      }).join('');
      const last = p.steps[n - 1];
      const destKnown = j.done || store.isCollected(last.star);
      const cta = j.done ? ['Replay adventure', 0] : [j.started ? `Continue: stop ${j.current + 1}` : 'Start adventure', j.current];
      return `<div class="stack">
        <header class="adventure-head glass rise" style="--c:${fam.color}">
          <span class="adv-medal">${p.emoji}</span>
          <div class="grow"><span class="eyebrow">${fam.emoji} ${fam.title}</span><h1 class="display sm">${esc(p.title)}</h1><p>${esc(p.subtitle)}</p>
            <span class="head-stats">${stars(j.stars, 3, 'sm')}<span>${n} stops</span><span>${uniqueStars(p).filter(s => !store.isCollected(s)).length} mystery pals</span></span>
            <span class="head-progress">${bar(j.percent / 100, fam.color)}<b>${j.percent}%</b></span></div>
        </header>
        <div class="route-map" style="height:${height}px;--c:${fam.color}">
          ${bands.map((b, k) => {
            const loc = LOCATION[b.loc];
            const top = pts[b.from][1] - ROW / 2 + 6;
            const h = (b.to - b.from + 1) * ROW - 12;
            const side = pts[b.from][0] > 50 ? 'r' : 'l';
            return `<div class="band ${side}" style="top:${top}px;height:${h}px;--lc:${loc.color}"><span class="band-art">${organCloseup(b.loc)}</span><span class="band-label">${loc.emoji} ${esc(loc.name)}</span></div>`;
          }).join('')}
          <svg class="route-line" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">
            <path d="${full}" class="rl-base" vector-effect="non-scaling-stroke"/>
            ${lit ? `<path d="${lit}" class="rl-glow" vector-effect="non-scaling-stroke"/><path d="${lit}" class="rl-lit" vector-effect="non-scaling-stroke"/>` : ''}
          </svg>
          ${nodes}
          <div class="cp destination${j.done ? ' s-done' : ' s-locked'}" style="left:50%;top:${endY}px">
            <span class="cp-orb">${j.done ? '🏆' : '🏁'}</span>
            <span class="cp-label">${j.done ? `Destination reached: ${esc(firstName(character(last.star)))}!` : `Destination: ${destKnown ? esc(firstName(character(last.star))) : '???'}`}</span>
            ${j.done ? `<a class="cp-tag here" href="#finish-${p.id}">${j.stars < 3 ? 'Bonus star question' : 'Trophy room'}</a>` : '<span class="cp-tag">Bonus star waits here</span>'}
          </div>
        </div>
        <div class="sticky-cta"><a class="btn big" style="--b:${fam.color}" href="#stop-${p.id}.${cta[1]}">${cta[0]} ➜</a></div>
      </div>`;
    },
  };
}

// MARK: - Stop

export function stop(app, arg) {
  const [pid, idx] = arg.split('.');
  const p = findPathway(pid);
  const i = Number(idx);
  if (!p || !Number.isInteger(i) || i < 0 || i >= p.steps.length) return null;
  const j = journey(p);
  if (!j.canOpen(i)) return { redirect: `#stop-${p.id}.${j.current}` };
  const fam = FAMILY[p.family];
  const st = p.steps[i];
  const loc = LOCATION[st.location];
  return {
    tab: 'pathways', world: 'tint', tint: loc.color, title: p.title, back: `#pathway-${p.id}`, enter: 'slide',
    mount() {
      store.reachStop(p.id, i);
      store.collect(st.star);
    },
    html() {
      const c = character(st.star);
      const last = i === p.steps.length - 1;
      const nextLabel = last ? 'Finish!' : p.steps[i + 1].star === st.star ? 'Next stop' : 'Transform!';
      return `<div class="stop">
        <div class="stop-top">
          <span class="eyebrow">Stop ${i + 1} of ${p.steps.length}</span>
          ${routeStrip(p, { done: false, current: i })}
          ${chip(`📍 ${loc.emoji} ${esc(loc.name)}`, loc.color, 'solid')}
        </div>
        <div class="stop-scene" style="--c:${c.color};--lc:${loc.color}">
          <span class="scene-art">${organCloseup(st.location)}</span>
          <span class="pedestal"></span>
          <span class="stop-pal pop">${pal(st.star, { size: 150, excited: true })}</span>
        </div>
        <div class="stop-name rise"><h1 class="display">${esc(c.name)}</h1><span>${esc(c.molecule)}</span></div>
        <div class="speech glass slide-in"><h2>${esc(st.title)}</h2><p>${esc(st.text)}</p></div>
        ${st.helpers.length ? helperChips(st.helpers) : ''}
        <div class="controls">
          <a class="btn ghost square" ${i === 0 ? 'aria-disabled="true" tabindex="-1"' : `href="#stop-${p.id}.${i - 1}" data-replace`} aria-label="Previous stop">‹</a>
          <button class="btn big grow" style="--b:${fam.color}" data-action="next">${nextLabel} ➜</button>
        </div>
      </div>`;
    },
    action(name, el) {
      if (name !== 'next') return;
      sparkle(el, fam.color);
      if (i + 1 < p.steps.length) { location.replace(`#stop-${p.id}.${i + 1}`); return; }
      const gained = store.awardPathway(p.id, 2);
      reward({
        title: 'Adventure complete!', emoji: p.emoji, stars: store.pathwayStars(p.id), gained, color: fam.color,
        lines: store.pathwayStars(p.id) < 3 ? ['Answer the bonus question for a third star.'] : [],
      });
      location.replace(`#finish-${p.id}`);
    },
  };
}

// MARK: - Finish line

export function finish(app, id) {
  const p = findPathway(id);
  if (!p) return null;
  if (!journey(p).done) return { redirect: `#pathway-${p.id}` };
  const fam = FAMILY[p.family];
  const card = {};
  return {
    tab: 'pathways', world: 'journey', title: p.title, back: `#pathway-${p.id}`,
    html() {
      const s = store.pathwayStars(p.id);
      return `<div class="stack center">
        <div class="trophy rise">${p.emoji}</div>
        <h1 class="display">Adventure complete!</h1>
        ${stars(s, 3, 'big')}
        <section class="glass wide">${sectionTitle('The transformation')}${transformationChain(uniqueStars(p))}</section>
        ${questionCard(p.check, card, s < 3 ? '⭐ Bonus star question' : 'Bonus question (star earned)')}
        <div class="row buttons wide"><a class="btn ghost" href="#stop-${p.id}.0">↻ Replay</a><a class="btn" style="--b:${fam.color}" href="#pathways">More adventures</a></div>
      </div>`;
    },
    answer(k, el) {
      if (card.picked != null) return;
      card.picked = card.choices[k];
      if (card.picked === p.check.correct) {
        store.answeredCorrectly();
        sparkle(el, '#5FD3A6');
        const gained = store.awardPathway(p.id, 3);
        if (gained) reward({ title: 'Bonus star!', emoji: '⭐', stars: 3, gained, color: fam.color });
      }
      app.rerender();
    },
  };
}

// Reusable pieces of the game UI. They render HTML strings from state; they hold no state themselves.
import {
  FAMILY, LOCATION, character, firstName, shortMolecule, helperCharacterID, uniqueStars, GAME_PALS,
} from '../data.js';
import { store } from '../state/store.js';
import { journey, palMastery, palClues, player, questStatus } from '../state/progress.js';
import { esc } from './dom.js';
import { pal } from './pal.js';
import { ICONS } from './art.js';

// MARK: - Progress

/** A circular progress ring around any content. */
export function progressRing(value, { size = 56, stroke = 5, color = 'var(--mango)', track = 'rgba(255,255,255,.55)', inner = '' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(Math.max(value, 0), 1);
  return `<span class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
    <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - v)).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>
    <span class="ring-inner">${inner}</span></span>`;
}

export const bar = (value, color = 'var(--pink)') =>
  `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value * 100)}"><div style="width:max(10px, ${Math.min(Math.max(value, 0), 1) * 100}%);background:${color}"></div></div>`;

export const stars = (count, total = 3, cls = '') =>
  `<span class="stars ${cls}" role="img" aria-label="${count} of ${total} stars">${
    Array.from({ length: total }, (_, i) => `<span class="${i < count ? 'on' : ''}">${ICONS.star}</span>`).join('')}</span>`;

export const chip = (text, color = 'var(--pink)', cls = '') => `<span class="chip ${cls}" style="--c:${color}">${text}</span>`;

export const sectionTitle = (title, extra = '') => `<div class="section-title"><h2>${esc(title)}</h2>${extra}</div>`;

// MARK: - Header

/** Compact player status for the header: rank ring, stars and pals. */
export function playerChip() {
  const p = player();
  return `<a class="player-chip" href="#profile" aria-label="${esc(p.rank.title)}. Open your profile">
    ${progressRing(p.rankProgress, { size: 42, stroke: 4, color: 'var(--mango)', inner: `<span class="rank-emoji">${p.rank.emoji}</span>` })}
    <span class="player-text"><b>${esc(p.rank.title)}</b><small>${p.next ? `${p.toNext} ★ to ${esc(p.next.title)}` : 'Top rank!'}</small></span></a>`;
}

export function counters() {
  const p = player();
  return `<span class="counter" data-counter="stars" title="Stars">${ICONS.star}<b>${p.stars}</b><small>/${p.maxStars}</small></span>
    <a class="counter pals" data-counter="pals" href="#pals" title="Molecule Pals">${pal('glucose', { size: 20, still: true, shadow: false, label: '' })}<b>${p.pals}</b><small>/${p.maxPals}</small></a>`;
}

// MARK: - Quests

export function questCard({ compact = false } = {}) {
  const q = questStatus();
  const chest = `<button class="chest${q.ready ? ' ready' : ''}${q.claimed ? ' open' : ''}" data-action="claim-chest" ${q.ready ? '' : 'disabled'}
      aria-label="${q.claimed ? 'Treasure opened today' : q.ready ? 'Open your treasure' : 'Treasure: finish all quests to open'}">${ICONS.chest}</button>`;
  return `<section class="quest-card glass${compact ? ' compact' : ''}" aria-label="Today's quests">
    <header><div><span class="eyebrow">Today's quests</span><b class="quest-count">${q.done}/${q.total}</b></div>${chest}</header>
    <ul>${q.list.map(x => `<li class="${x.done ? 'done' : ''}"><a href="${x.href}">
      <span class="q-emoji">${x.done ? '✔' : x.emoji}</span><span class="q-text">${esc(x.text)}</span>
      ${x.goal > 1 ? `<span class="q-num">${x.progress}/${x.goal}</span>` : ''}</a></li>`).join('')}</ul>
    <p class="quest-foot">${q.claimed ? 'Treasure opened! New quests arrive tomorrow.' : q.ready ? 'Open the treasure chest to reveal a Mystery Pal!' : 'Finish all three to open the treasure chest.'}</p>
  </section>`;
}

// MARK: - Adventures

/** A row of pal faces for a pathway: discovered pals show, the rest stay mysteries. */
export function palRow(ids, size = 30) {
  return `<span class="pal-row">${ids.map(id => pal(id, { size, still: true, shadow: false, mystery: !store.isCollected(id) })).join('')}</span>`;
}

export function adventureTile(p, { hero = false } = {}) {
  const j = journey(p);
  const fam = FAMILY[p.family];
  const mysteries = uniqueStars(p).filter(id => !store.isCollected(id)).length;
  const status = j.done ? 'Complete' : j.started ? `Stop ${j.current + 1} of ${p.steps.length}` : 'New adventure';
  return `<a class="adventure-tile${hero ? ' hero' : ''}${j.done ? ' done' : ''}" href="#pathway-${p.id}" style="--c:${fam.color}">
    <span class="adv-art"><span class="adv-emoji">${p.emoji}</span>${routeStrip(p, j)}</span>
    <span class="adv-body">
      <span class="adv-status">${status}</span>
      <b class="adv-title">${esc(p.title)}</b>
      <span class="adv-sub">${esc(p.subtitle)}</span>
      <span class="adv-meta">${palRow(uniqueStars(p).slice(0, 6), 26)}${mysteries ? `<span class="mystery-count">${mysteries} mystery</span>` : ''}</span>
    </span>
    <span class="adv-side">${progressRing(j.percent / 100, { size: 50, stroke: 5, color: fam.color, inner: `<b>${j.percent}%</b>` })}${stars(j.stars, 3, 'sm')}</span>
  </a>`;
}

/** Mini route: one dot per stop, lit up to where the player has been. */
export function routeStrip(p, j = journey(p)) {
  return `<span class="route-strip" aria-hidden="true">${p.steps.map((st, i) =>
    `<i class="${j.done || i < (j.current ?? 0) ? 'lit' : i === j.current ? 'here' : ''}" style="--lc:${LOCATION[st.location].color}"></i>`).join('')}</span>`;
}

// MARK: - Pals

export function palCard(c) {
  const fam = FAMILY[c.family];
  const m = palMastery(c.id);
  return `<a class="pal-card" href="#pal-${c.id}" style="--c:${fam.color};--pc:${c.color}">
    <span class="card-foil"></span>
    <span class="card-art">${pal(c.id, { size: 72 })}</span>
    <b class="card-name">${esc(firstName(c))}</b>
    <span class="card-fam">${fam.emoji} ${fam.short}</span>
    ${m ? stars(m.stars, 3, 'xs') : ''}
  </a>`;
}

export function mysteryCard(c) {
  const fam = FAMILY[c.family];
  const clue = palClues(c.id)[1] || palClues(c.id)[0];
  return `<a class="pal-card mystery" href="#pal-${c.id}" style="--c:${fam.color};--pc:${c.color}" aria-label="Mystery pal. ${esc(clue)}">
    <span class="card-fog"></span>
    <span class="card-art">${pal(c.id, { size: 72, mystery: true })}</span>
    <b class="card-name">???</b>
    <span class="card-clue">${esc(clue)}</span>
  </a>`;
}

/** Chips for enzymes, vitamins and minerals. Helpers that are also Molecule Pals can be tapped to meet them. */
export function helperChips(helpers) {
  return `<div class="helpers"><span class="eyebrow">Helpers on this stop</span><div class="flow">${helpers.map(h => {
    const id = helperCharacterID(h);
    if (!id) return `<span class="helper">${esc(h)}</span>`;
    const c = character(id);
    const known = store.isCollected(id);
    return `<a class="helper pal-helper" href="#meet-${id}" style="--c:${c.color}" title="Meet ${esc(known ? c.name : 'a new pal')}">
      ${pal(id, { size: 24, still: true, shadow: false, mystery: !known })}<span>${esc(h)}</span>${known ? '' : '<span class="new">NEW</span>'}</a>`;
  }).join('')}</div></div>`;
}

/** Faces joined by arrows: how one molecule turns into the next. */
export function transformationChain(ids, size = 54) {
  return `<div class="chain">${ids.map((id, i) => `${i ? '<span class="arrow" aria-hidden="true">➜</span>' : ''}
    <div class="link" style="width:${size + 20}px">${pal(id, { size, still: true })}<span>${esc(shortMolecule(character(id)))}</span></div>`).join('')}</div>`;
}

// MARK: - Play

export function gamePals(gameId) {
  return GAME_PALS[gameId] || [];
}

export function badgeMedal(b) {
  return `<div class="medal${b.earned ? ' earned' : ''}"><span class="medal-face">${b.emoji}</span><b>${esc(b.title)}</b><small>${esc(b.detail)}</small>
    <span class="sr">${b.earned ? 'Earned' : 'Not earned yet'}</span></div>`;
}

// MARK: - Questions

/**
 * A multiple-choice question with instant feedback. `state` = { choices, picked } is kept by the caller
 * so the card survives re-renders. Buttons carry data-answer; the caller handles clicks.
 */
export function questionCard(q, state, title = '') {
  if (!state.choices) {
    const a = [q.correct, ...q.wrong];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    state.choices = a;
  }
  const picked = state.picked;
  return `<div class="question glass">
    ${title ? `<span class="eyebrow">${esc(title)}</span>` : ''}
    <p class="prompt">${esc(q.prompt)}</p>
    <div class="choices">${state.choices.map((choice, i) => {
      let cls = '';
      let icon = String.fromCharCode(65 + i);
      if (picked != null) {
        if (choice === q.correct) { cls = 'good'; icon = '✓'; } else if (choice === picked) { cls = 'bad'; icon = '✕'; } else cls = 'dim';
      }
      return `<button class="choice ${cls}" data-answer="${i}" ${picked != null ? 'disabled' : ''}><b class="key">${icon}</b><span>${esc(choice)}</span></button>`;
    }).join('')}</div>
    ${picked != null ? `<p class="feedback ${picked === q.correct ? 'good' : 'bad'}" role="status">${picked === q.correct ? 'Correct! ' : 'Not quite. '}${esc(q.explanation)}</p>` : ''}
  </div>`;
}

export const scoreBadge = (label, value, color) =>
  `<div class="score-badge" style="--c:${color}"><small>${esc(label)}</small><b>${esc(value)}</b></div>`;

export const speaker = (id, message) =>
  `<div class="speaker glass">${pal(id, { size: 56, excited: true, shadow: false })}<p role="status">${esc(message)}</p></div>`;


// Game rules computed from the save: journey progress, organ discovery states, pal clues and mastery,
// and today's quests. No DOM here.
import {
  CAST, LOCATIONS, LOCATION, PATHWAYS, RECIPES, GAMES, GAME_PALS, FAMILY_CLUE, character, helperCharacterID,
} from '../data.js';
import { store } from './store.js';

// MARK: - Journeys

/** Where the player is on a pathway. `current` is the stop to play next (null once complete). */
export function journey(p) {
  const done = store.pathwayStars(p.id) > 0;
  const reached = done ? p.steps.length - 1 : store.reached(p.id);
  const current = done ? null : Math.max(0, reached);
  const seen = done ? p.steps.length : reached + 1;
  return {
    done, reached, current, stars: store.pathwayStars(p.id),
    started: done || reached >= 0,
    percent: Math.round((seen / p.steps.length) * 100),
    /** Stops you've seen, plus the very next one, can be opened; later ones stay locked. */
    canOpen: i => done || i <= reached + 1,
  };
}

export const stopSeen = (p, i) => store.pathwayStars(p.id) > 0 || store.reached(p.id) >= i;

/** The adventure to feature: the most recent unfinished one, else the first not finished. */
export function nextAdventure() {
  const last = PATHWAYS.find(p => p.id === store.lastPathway);
  if (last && !journey(last).done) return last;
  return PATHWAYS.find(p => journey(p).started && !journey(p).done)
    || PATHWAYS.find(p => !journey(p).done) || null;
}

// MARK: - Organs

export const stopsAt = loc => PATHWAYS.flatMap(p => p.steps.map((st, i) => ({ p, i, st })).filter(x => x.st.location === loc));

/**
 * Discovery state of a body location:
 * undiscovered → available (visited, or where the next adventure goes) → inProgress → mastered.
 */
export function organState(loc) {
  const stops = stopsAt(loc);
  const seen = stops.filter(({ p, i }) => stopSeen(p, i)).length;
  const progress = stops.length ? seen / stops.length : 0;
  let state = 'undiscovered';
  if (stops.length && seen === stops.length) state = 'mastered';
  else if (seen > 0) state = 'inProgress';
  else if (store.hasVisited(loc) || suggestedLocations().has(loc)) state = 'available';
  return { state, seen, total: stops.length, progress };
}

function suggestedLocations() {
  const set = new Set(['mouth']);
  const next = nextAdventure();
  if (next) set.add(next.steps[journey(next).current ?? 0].location);
  return set;
}

/** Pals whose stops happen at this location, in order of appearance. */
export const palsAt = loc => [...new Set(stopsAt(loc).map(x => x.st.star))];

// MARK: - Pals

/** Every pathway a pal takes part in, as the star of a stop or as a helper chip. */
export function palPathways(id) {
  return PATHWAYS.filter(p => p.steps.some(st => st.star === id || st.helpers.some(h => helperCharacterID(h) === id)));
}

export function palPlaces(id) {
  const locs = new Set();
  PATHWAYS.forEach(p => p.steps.forEach(st => {
    if (st.star === id || st.helpers.some(h => helperCharacterID(h) === id)) locs.add(st.location);
  }));
  RECIPES.forEach(r => { if (r.chain.includes(id)) locs.add(r.location); });
  return [...locs].map(l => LOCATION[l]);
}

/** Mastery 0–3: how many of the pal's journeys and recipes the player has completed. */
export function palMastery(id) {
  const paths = palPathways(id);
  const recipes = RECIPES.filter(r => r.chain.includes(id));
  const total = paths.length + recipes.length;
  if (!total) return null;
  const done = paths.filter(p => store.pathwayStars(p.id) > 0).length
    + recipes.filter(r => store.hormoneStars(r.id) > 0).length;
  return { done, total, stars: Math.round((done / total) * 3) };
}

/** Clues for an undiscovered pal, taken from its real data so they never mislead. */
export function palClues(id) {
  const c = character(id);
  const clues = [FAMILY_CLUE[c.family]];
  const places = palPlaces(id);
  if (places.length) clues.push(`Found in the ${places[0].name.toLowerCase()}.`);
  if (c.foods.length) clues.push(`Clue: ${c.foods[0]}.`);
  return clues;
}

/** The best place to go and meet a pal. */
export function whereToFind(id) {
  const asStar = PATHWAYS.find(p => p.steps.some(st => st.star === id));
  if (asStar) {
    const i = asStar.steps.findIndex(st => st.star === id);
    return { href: `#pathway-${asStar.id}`, label: `${asStar.title}, stop ${i + 1}` };
  }
  const recipe = RECIPES.find(r => r.chain.includes(id));
  if (recipe) return { href: `#hormone-${recipe.id}`, label: `Build ${character(recipe.id).molecule.split(' (')[0]} in the Hormone Factory` };
  const game = GAMES.find(g => GAME_PALS[g.id].includes(id));
  if (game) return { href: `#game-${game.id}`, label: `Earn a star in ${game.title}` };
  const helper = palPathways(id)[0];
  if (helper) return { href: `#pathway-${helper.id}`, label: `Tap its helper chip in ${helper.title}` };
  return null;
}

export const undiscovered = () => CAST.filter(c => !store.isCollected(c.id));

// MARK: - Quests

const dayNumber = () => {
  const [y, m, d] = store.daily.day.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

/** Three quests a day: explore a place, travel or answer, and one more adventure. */
export function quests() {
  const n = dayNumber();
  const d = store.daily;
  const loc = LOCATIONS[n % LOCATIONS.length];
  const list = [{
    id: 'visit', emoji: loc.emoji, text: `Dive into the ${loc.name}`, href: `#place-${loc.id}`,
    progress: d.visits.includes(loc.id) ? 1 : 0, goal: 1,
  }];
  list.push(n % 2 === 0
    ? { id: 'stops', emoji: '🧭', text: 'Travel 3 stops on any adventure', href: '#pathways', progress: Math.min(d.stops, 3), goal: 3 }
    : { id: 'correct', emoji: '💡', text: 'Answer 3 questions right', href: '#game-quiz', progress: Math.min(d.correct, 3), goal: 3 });
  const third = n % 3;
  if (third === 0) list.push({ id: 'newPal', emoji: '✨', text: 'Meet a new Molecule Pal', href: '#pals', progress: Math.min(d.newPals, 1), goal: 1 });
  else if (third === 1) {
    const g = GAMES[Math.floor(n / 3) % GAMES.length];
    list.push({ id: 'game', emoji: '🎮', text: `Finish a round of ${g.title}`, href: `#game-${g.id}`, progress: d.games.includes(g.id) ? 1 : 0, goal: 1 });
  } else list.push({ id: 'star', emoji: '⭐', text: 'Earn a new star', href: '#play', progress: Math.min(d.stars, 1), goal: 1 });
  return list.map(q => ({ ...q, done: q.progress >= q.goal }));
}

export function questStatus() {
  const list = quests();
  const done = list.filter(q => q.done).length;
  return { list, done, total: list.length, ready: done === list.length && !store.daily.claimed, claimed: store.daily.claimed };
}

// MARK: - Player

export function player() {
  const rank = store.rank;
  const next = store.nextRank;
  const total = store.totalStars;
  return {
    rank, next, stars: total, maxStars: store.maxStars, pals: store.collectedCount, maxPals: CAST.length,
    toNext: next ? next.minStars - total : 0,
    rankProgress: next ? (total - rank.minStars) / Math.max(1, next.minStars - rank.minStars) : 1,
  };
}


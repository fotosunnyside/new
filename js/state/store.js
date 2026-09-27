// Saved progress (mirrors ProgressStore.swift, plus web-only journey, discovery and quest data).
// Only mutations live here. Anything computed from the save lives in progress.js.
import { CAST, PATHWAYS, RECIPES, RANKS, SCORED_GAMES } from '../data.js';

const KEY = 'NutriQuest.save.v1';
const empty = () => ({
  pathwayStars: {}, gameStars: {}, bestScores: {}, hormoneStars: {}, collected: [],
  // Added by the web redesign. Older saves simply start with these empty.
  collectedAt: {}, reached: {}, visited: [], lastPathway: null, daily: null, chests: 0,
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch { /* storage unavailable: start fresh */ }
  return empty();
}

let data = load();
const listeners = new Set();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* keep in memory only */ }
  listeners.forEach(fn => fn());
}

const sum = obj => Object.values(obj).reduce((a, b) => a + b, 0);
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Today's quest counters, reset each day. */
function daily() {
  if (!data.daily || data.daily.day !== today()) {
    data.daily = { day: today(), visits: [], stops: 0, newPals: 0, correct: 0, games: [], stars: 0, claimed: false };
  }
  return data.daily;
}

export const store = {
  onChange(fn) { listeners.add(fn); },

  // MARK: Collection
  isCollected: id => data.collected.includes(id),
  collectedOn: id => data.collectedAt[id] || null,
  collectedIndex: id => data.collected.indexOf(id),
  collect(id) {
    if (data.collected.includes(id)) return false;
    data.collected.push(id);
    data.collectedAt[id] = today();
    daily().newPals++;
    save();
    return true;
  },
  get collectedCount() { return CAST.filter(c => data.collected.includes(c.id)).length; },

  // MARK: Journeys
  reached: id => (data.reached[id] ?? -1),
  /** Records that the player stood on a pathway stop. */
  reachStop(id, index) {
    daily().stops++;
    data.lastPathway = id;
    if (index > (data.reached[id] ?? -1)) data.reached[id] = index;
    save();
  },
  get lastPathway() { return data.lastPathway; },
  hasVisited: loc => data.visited.includes(loc),
  visit(loc) {
    const d = daily();
    if (!d.visits.includes(loc)) d.visits.push(loc);
    if (!data.visited.includes(loc)) data.visited.push(loc);
    save();
  },

  // MARK: Stars
  pathwayStars: id => data.pathwayStars[id] || 0,
  awardPathway(id, stars) {
    const old = data.pathwayStars[id] || 0;
    if (stars <= old) return 0;
    data.pathwayStars[id] = Math.min(stars, 3);
    daily().stars += data.pathwayStars[id] - old;
    save();
    return data.pathwayStars[id] - old;
  },

  hormoneStars: id => data.hormoneStars[id] || 0,
  awardHormone(id, stars) {
    const old = data.hormoneStars[id] || 0;
    const d = daily();
    if (!d.games.includes('factory')) d.games.push('factory');
    if (stars > old) {
      data.hormoneStars[id] = Math.min(stars, 3);
      d.stars += data.hormoneStars[id] - old;
    }
    save();
    return Math.max(0, (data.hormoneStars[id] || 0) - old);
  },

  gameStars: game => data.gameStars[game] || 0,
  bestScore: game => data.bestScores[game],
  /** Records a finished game. Returns { isBest, gained } where gained is new stars earned. */
  record(game, score, stars) {
    const d = daily();
    if (!d.games.includes(game)) d.games.push(game);
    const isBest = data.bestScores[game] === undefined || score > data.bestScores[game];
    if (isBest) data.bestScores[game] = score;
    const old = data.gameStars[game] || 0;
    if (stars > old) data.gameStars[game] = Math.min(stars, 3);
    const gained = (data.gameStars[game] || 0) - old;
    d.stars += gained;
    save();
    return { isBest, gained };
  },

  answeredCorrectly() { daily().correct++; save(); },

  get totalStars() { return sum(data.pathwayStars) + sum(data.hormoneStars) + sum(data.gameStars); },
  maxStars: PATHWAYS.length * 3 + RECIPES.length * 3 + SCORED_GAMES.length * 3,
  get rank() { return [...RANKS].reverse().find(r => this.totalStars >= r.minStars) || RANKS[0]; },
  get nextRank() { return RANKS.find(r => this.totalStars < r.minStars) || null; },

  get badges() {
    const paths = Object.values(data.pathwayStars).filter(s => s > 0).length;
    const built = Object.values(data.hormoneStars).filter(s => s > 0).length;
    const pals = this.collectedCount;
    return [
      { emoji: '🧭', title: 'First Journey', detail: 'Finish any pathway', earned: paths >= 1 },
      { emoji: '🗺️', title: 'Grand Tour', detail: 'Finish every pathway', earned: paths >= PATHWAYS.length },
      { emoji: '🃏', title: 'Collector', detail: 'Collect 25 Molecule Pals', earned: pals >= 25 },
      { emoji: '🏆', title: 'Full Set', detail: 'Collect every Molecule Pal', earned: pals >= CAST.length },
      { emoji: '🧑‍🍳', title: 'Hormone Chef', detail: 'Build 4 hormones', earned: built >= 4 },
      { emoji: '🏭', title: 'Factory Boss', detail: 'Build every hormone', earned: built >= RECIPES.length },
      { emoji: '✂️', title: 'Snip Master', detail: '3 stars in Enzyme Scissors', earned: this.gameStars('scissors') >= 3, game: 'scissors' },
      { emoji: '🚦', title: 'Fat Traffic Cop', detail: '3 stars in Fat Traffic Control', earned: this.gameStars('fatRouter') >= 3, game: 'fatRouter' },
      { emoji: '🧬', title: 'Ribosome Pro', detail: '3 stars in Ribosome Rush', earned: this.gameStars('proteinBuilder') >= 3, game: 'proteinBuilder' },
      { emoji: '🧠', title: 'Quiz Whiz', detail: '3 stars in the Molecule Quiz', earned: this.gameStars('quiz') >= 3, game: 'quiz' },
    ];
  },

  // MARK: Quests
  get daily() { return daily(); },
  claimChest() {
    const d = daily();
    if (d.claimed) return false;
    d.claimed = true;
    data.chests++;
    save();
    return true;
  },
  get chests() { return data.chests; },

  get hasOnboarded() {
    try { return localStorage.getItem('NutriQuest.hasOnboarded') === '1'; } catch { return false; }
  },
  finishOnboarding() {
    try { localStorage.setItem('NutriQuest.hasOnboarded', '1'); } catch { /* ignore */ }
  },

  reset() {
    data = empty();
    save();
  },
};

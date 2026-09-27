// Saved progress, mirroring ProgressStore.swift. Stored in localStorage when available.
import { CAST, PATHWAYS, RECIPES, RANKS, SCORED_GAMES } from './data.js';

const KEY = 'NutriQuest.save.v1';
const empty = () => ({ pathwayStars: {}, gameStars: {}, bestScores: {}, hormoneStars: {}, collected: [] });

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

export const store = {
  onChange(fn) { listeners.add(fn); },

  isCollected: id => data.collected.includes(id),
  collect(id) {
    if (data.collected.includes(id)) return false;
    data.collected.push(id);
    save();
    return true;
  },
  get collectedCount() { return CAST.filter(c => data.collected.includes(c.id)).length; },

  pathwayStars: id => data.pathwayStars[id] || 0,
  awardPathway(id, stars) {
    if (stars <= (data.pathwayStars[id] || 0)) return;
    data.pathwayStars[id] = Math.min(stars, 3);
    save();
  },

  hormoneStars: id => data.hormoneStars[id] || 0,
  awardHormone(id, stars) {
    if (stars <= (data.hormoneStars[id] || 0)) return;
    data.hormoneStars[id] = Math.min(stars, 3);
    save();
  },

  gameStars: game => data.gameStars[game] || 0,
  bestScore: game => data.bestScores[game],
  /** Records a finished game. Returns true if it's a new best score. */
  record(game, score, stars) {
    const isBest = data.bestScores[game] === undefined || score > data.bestScores[game];
    if (isBest) data.bestScores[game] = score;
    if (stars > (data.gameStars[game] || 0)) data.gameStars[game] = Math.min(stars, 3);
    save();
    return isBest;
  },

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
      { emoji: '✂️', title: 'Snip Master', detail: '3 stars in Enzyme Scissors', earned: this.gameStars('scissors') >= 3 },
      { emoji: '🚦', title: 'Fat Traffic Cop', detail: '3 stars in Fat Traffic Control', earned: this.gameStars('fatRouter') >= 3 },
      { emoji: '🧬', title: 'Ribosome Pro', detail: '3 stars in Ribosome Rush', earned: this.gameStars('proteinBuilder') >= 3 },
      { emoji: '🧠', title: 'Quiz Whiz', detail: '3 stars in the Molecule Quiz', earned: this.gameStars('quiz') >= 3 },
    ];
  },

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

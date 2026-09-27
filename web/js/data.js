// App-level definitions that live in the Swift model layer (Models.swift, ProgressStore.swift,
// GameContent.swift). The educational content itself is generated into content.js.
import { CONTENT } from './content.js';

export const FAMILIES = [
  { id: 'carbs', title: 'Carbohydrates', short: 'Carbs', emoji: '🍞', color: '#FF8C42' },
  { id: 'fats', title: 'Fats & Lipids', short: 'Fats', emoji: '🥑', color: '#F4B400' },
  { id: 'proteins', title: 'Proteins & Amino Acids', short: 'Proteins', emoji: '🥚', color: '#FF5C8A' },
  { id: 'vitamins', title: 'Vitamins', short: 'Vitamins', emoji: '🥕', color: '#3BB273' },
  { id: 'minerals', title: 'Minerals', short: 'Minerals', emoji: '💎', color: '#3A86FF' },
  { id: 'hormones', title: 'Hormones & Messengers', short: 'Hormones', emoji: '📬', color: '#9B5DE5' },
  { id: 'helpers', title: 'Enzyme Crew', short: 'Enzymes', emoji: '✂️', color: '#00A6C8' },
  { id: 'energy', title: 'Energy Makers', short: 'Energy', emoji: '⚡️', color: '#FF595E' },
];
export const FAMILY = Object.fromEntries(FAMILIES.map(f => [f.id, f]));

// `map` is the position on the 100 × 160 body grid; locations without one live "inside a cell".
export const LOCATIONS = [
  { id: 'brain', name: 'Brain', emoji: '🧠', color: '#F08CAE', map: [44, 11],
    blurb: "Your command center uses about 20% of your body's energy. It builds its own serotonin and dopamine from amino acids, and its tiny pineal gland makes melatonin at night." },
  { id: 'mouth', name: 'Mouth', emoji: '👄', color: '#FF7B9C', map: [56, 23],
    blurb: 'Digestion starts here! Teeth crush food into small pieces and saliva adds amylase, an enzyme that begins snipping starch into sugars.' },
  { id: 'thyroid', name: 'Thyroid', emoji: '🦋', color: '#9B5DE5', map: [50, 35],
    blurb: "A butterfly-shaped gland in your neck. It traps iodine and sticks it onto tyrosine to build thyroid hormones, your metabolism's thermostat." },
  { id: 'lymph', name: 'Lymph Vessels', emoji: '🛤️', color: '#52B788', map: [36, 42],
    blurb: 'A second highway system. Chylomicrons packed with long-chain fats ride through the lymph before joining the blood near your heart.' },
  { id: 'bloodstream', name: 'Heart & Blood', emoji: '❤️', color: '#E63946', map: [61, 43],
    blurb: "The body's delivery network. Blood carries glucose, amino acids, fats, vitamins, hormones and oxygen to trillions of cells." },
  { id: 'liver', name: 'Liver', emoji: '🧪', color: '#A0522D', map: [39, 56],
    blurb: "The body's chemistry lab! It stores glycogen, makes cholesterol and bile, sorts amino acids, turns ammonia into urea, makes ketones and activates vitamin D." },
  { id: 'stomach', name: 'Stomach', emoji: '🌀', color: '#FF9F1C', map: [61, 57],
    blurb: 'A stretchy, acid-filled mixing bag. Strong acid unfolds proteins and kills germs while pepsin starts chopping proteins into pieces.' },
  { id: 'pancreas', name: 'Pancreas', emoji: '⚗️', color: '#F4B400', map: [50, 67],
    blurb: 'Does two big jobs: it sends digestive enzymes to the small intestine AND releases insulin into the blood.' },
  { id: 'kidney', name: 'Kidneys', emoji: '🫘', color: '#B5838D', map: [35, 72],
    blurb: 'Two bean-shaped filters that clean your blood, flush out urea and make the active form of vitamin D.' },
  { id: 'adrenal', name: 'Adrenal Glands', emoji: '⚡️', color: '#FF006E', map: [65, 72],
    blurb: 'Little glands sitting on top of your kidneys. They make adrenaline for fast action and cortisol for stress and waking up.' },
  { id: 'smallIntestine', name: 'Small Intestine', emoji: '🍝', color: '#F4845F', map: [46, 83],
    blurb: 'About 6 meters long and lined with tiny fingers called villi. Most nutrients are finished off and absorbed here!' },
  { id: 'largeIntestine', name: 'Large Intestine', emoji: '🦠', color: '#80B918', map: [64, 88],
    blurb: 'Home to trillions of friendly microbes that ferment fiber into short-chain fatty acids and even make some vitamin K.' },
  { id: 'reproductive', name: 'Ovaries & Testes', emoji: '🌱', color: '#F72585', map: [50, 98],
    blurb: 'Glands that use cholesterol to make testosterone and estradiol, the hormones that guide growing up.' },
  { id: 'skin', name: 'Skin', emoji: '☀️', color: '#FFB703', map: [21, 78],
    blurb: 'Your largest organ! When sunlight hits it, a cholesterol cousin turns into vitamin D.' },
  { id: 'muscle', name: 'Muscles', emoji: '💪', color: '#EF476F', map: [60.5, 124],
    blurb: 'Muscles burn glucose and fat for movement, store glycogen, and use amino acids like leucine to grow stronger.' },
  { id: 'bones', name: 'Bones & Marrow', emoji: '🦴', color: '#8D99AE', map: [39.5, 140],
    blurb: 'Bones store calcium, and the marrow inside builds about 2 million new red blood cells every second!' },
  { id: 'cell', name: 'Body Cell', emoji: '🧫', color: '#00BBF9', map: null,
    blurb: 'The tiny unit of life. Inside, ribosomes build proteins and glycolysis splits glucose in two.' },
  { id: 'mitochondria', name: 'Mitochondria', emoji: '🔋', color: '#FF595E', map: null,
    blurb: 'The powerhouses inside your cells. They use oxygen to turn the energy in food into ATP.' },
];
export const LOCATION = Object.fromEntries(LOCATIONS.map(l => [l.id, l]));

export const CAST = CONTENT.cast;
const CAST_BY_ID = Object.fromEntries(CAST.map(c => [c.id, c]));
export const character = id => CAST_BY_ID[id] || CAST[0];
export const firstName = c => c.name.split(' ')[0];
export const shortMolecule = c => c.molecule.split(' (')[0];

/** Matches helper labels on pathway steps (e.g. "Vitamin B6 🔧") to Molecule Pals. */
export function helperCharacterID(helper) {
  const text = helper.toLowerCase();
  const hit = CONTENT.helperKeywords.find(([keyword]) => text.includes(keyword));
  return hit ? hit[1] : null;
}

export const PATHWAYS = CONTENT.pathways;
export const pathway = id => PATHWAYS.find(p => p.id === id);
export const uniqueStars = p => [...new Set(p.steps.map(s => s.star))];
export const pathwaysFeaturing = id => PATHWAYS.filter(p => p.steps.some(s => s.star === id));
export const pathwaysVisiting = loc => PATHWAYS.filter(p => p.steps.some(s => s.location === loc));

export const QUIZ_BANK = [...CONTENT.quizBank, ...PATHWAYS.map(p => p.check)];
export const RECIPES = CONTENT.recipes;
export const recipe = id => RECIPES.find(r => r.id === id);
export const helperToken = id =>
  CONTENT.helperTokens.find(t => t.id === id) || { id, name: id, emoji: '❔' };
export const FAT_MOLECULES = CONTENT.fats;
export const PEPTIDES = CONTENT.peptides;
const AMINO_BY_CODE = Object.fromEntries(CONTENT.aminoAcids.map(a => [a.code, a]));
export const amino = code =>
  AMINO_BY_CODE[code] || { code, short: code, name: code, essential: false, color: '#8D99AE' };

export const FAT_ROUTES = {
  short: { id: 'short', title: 'Colon Cell Café', emoji: '🦠', color: '#80B918', rule: 'Short chains (under 6 C)',
    explanation: 'Short-chain fatty acids (mostly made by gut microbes from fiber) are absorbed right in the gut and fuel colon cells.' },
  medium: { id: 'medium', title: 'Portal Vein Express', emoji: '🏎️', color: '#FF8C42', rule: 'Medium chains (6–12 C)',
    explanation: 'Medium-chain fatty acids skip the lymph and zoom straight to the liver through the portal vein.' },
  long: { id: 'long', title: 'Chylomicron Bus', emoji: '🚌', color: '#3A86FF', rule: 'Long chains (13+ C)',
    explanation: 'Long-chain fatty acids get packed into chylomicrons and ride the lymph before reaching the blood.' },
};
export const routeForCarbons = n => (n < 6 ? 'short' : n <= 12 ? 'medium' : 'long');

export const GAMES = [
  { id: 'scissors', title: 'Enzyme Scissors', subtitle: "Snip starch into glucose — but don't cut the fiber!", mascot: 'amylase', color: '#FF8C42' },
  { id: 'fatRouter', title: 'Fat Traffic Control', subtitle: 'Send short, medium & long-chain fats down the right route.', mascot: 'chylomicron', color: '#F4B400' },
  { id: 'factory', title: 'Hormone Factory', subtitle: 'Pick the right ingredients and helpers to cook up hormones.', mascot: 'serotonin', color: '#9B5DE5' },
  { id: 'proteinBuilder', title: 'Ribosome Rush', subtitle: 'Link amino acids in order to build real hormones.', mascot: 'ribosome', color: '#00A6C8' },
  { id: 'quiz', title: 'Molecule Quiz', subtitle: 'Ten quick questions. How much do you know?', mascot: 'mito', color: '#FF5C8A' },
];
export const GAME = Object.fromEntries(GAMES.map(g => [g.id, g]));
/** Games whose best result earns stars (the factory earns stars per recipe instead). */
export const SCORED_GAMES = ['scissors', 'fatRouter', 'proteinBuilder', 'quiz'];

export const RANKS = [
  { title: 'Curious Cell', emoji: '🧫', minStars: 0 },
  { title: 'Enzyme Apprentice', emoji: '✂️', minStars: 8 },
  { title: 'Molecule Mechanic', emoji: '🔧', minStars: 20 },
  { title: 'Pathway Pro', emoji: '🧭', minStars: 35 },
  { title: 'Hormone Hero', emoji: '🦸', minStars: 50 },
  { title: 'Metabolism Master', emoji: '👑', minStars: 65 },
];

export const shuffle = list => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const pick = list => list[Math.floor(Math.random() * list.length)];

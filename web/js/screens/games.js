// The five mini-games (Games/*.swift). Rules and scoring match the iOS app; only the presentation is new.
import {
  character, firstName, shortMolecule, LOCATION, RECIPES, recipe as findRecipe, helperToken, GAME, GAME_PALS,
  FAT_MOLECULES, FAT_ROUTES, routeForCarbons, PEPTIDES, amino, QUIZ_BANK, shuffle, pick,
} from '../data.js';
import { store } from '../state/store.js';
import { esc, shake } from '../ui/dom.js';
import { pal, bead } from '../ui/pal.js';
import { stars, bar, scoreBadge, speaker, questionCard, transformationChain, sectionTitle, palRow } from '../ui/components.js';
import { reward, sparkle } from '../ui/fx.js';

/** Records a finished round, shows the reward moment and reveals the game's pals on a starred round. */
function finishRound(gameId, { title, score, stars: count }) {
  const { isBest, gained } = store.record(gameId, score, count);
  const g = GAME[gameId];
  reward({ title, emoji: count >= 3 ? '🏆' : count === 2 ? '🎉' : '👍', stars: count, gained, score, isNewBest: isBest, color: g.color });
  if (count > 0) GAME_PALS[gameId].forEach(id => store.collect(id));
  return { score, stars: count, isNewBest: isBest };
}

function summary(gameId, { title, score, stars: count, isNewBest }, lessons) {
  const pals = GAME_PALS[gameId];
  return `<div class="stack center game-over">
    <h1 class="display">${esc(title)}</h1>
    ${stars(count, 3, 'big')}
    <p class="score-line">Score ${score}${isNewBest ? ' · <span class="hot">New best!</span>' : ''}</p>
    <section class="glass wide left">${sectionTitle('What you learned')}<ul class="lessons">${lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul></section>
    ${pals.length ? `<section class="glass wide">${sectionTitle('Pals in this game')}${palRow(pals, 40)}
      <p class="muted small">${count > 0 ? 'You met every pal in this game!' : 'Earn at least one star to discover them.'}</p></section>` : ''}
    <div class="row buttons wide"><button class="btn ghost" data-action="replay">↻ Play again</button><a class="btn" href="#play">Arcade</a></div>
  </div>`;
}

const hud = (left, right) => `<div class="hud glass">${left}<span class="hud-right">${right}</span></div>`;

// MARK: - Enzyme Scissors

const SCISSOR_ROUNDS = [
  { enzyme: 'Salivary Amylase', place: '👄 Mouth',
    tip: "You're Amy Amylase! Tap the orange α bonds to snip starch into sugar.",
    chains: [[false, 4], [false, 3]] },
  { enzyme: 'Pancreatic Amylase', place: '🍝 Small Intestine',
    tip: 'The pancreas sends backup! More starch is arriving. Snip fast!',
    chains: [[false, 4], [false, 4], [false, 3]] },
  { enzyme: 'Fiber Alert!', place: '🍝 Small Intestine',
    tip: "Green chains are FIBER with β bonds. Human enzymes can't cut them, so leave them for the gut microbes!",
    chains: [[false, 4], [true, 4], [false, 3], [true, 3]] },
  { enzyme: 'Maltase', place: '🍝 Gut wall',
    tip: 'Maltose twins! Split every pair into two glucose. Watch out for sneaky fiber.',
    chains: [[false, 2], [false, 2], [true, 2], [false, 2], [false, 2]] },
];

export function enzymeScissors(app) {
  let s;
  let timer;
  const score = () => Math.max(0, s.cuts * 10 - s.mistakes * 5);
  const elapsed = () => Math.floor((Date.now() - s.start) / 1000);

  function startRound(i) {
    s.round = i;
    s.chains = SCISSOR_ROUNDS[i].chains.map(([isFiber, beads]) => ({ isFiber, bonds: Array(beads - 1).fill(false) }));
    s.roundDone = false;
    s.message = SCISSOR_ROUNDS[i].tip;
  }
  function start() {
    s = { cuts: 0, mistakes: 0, start: Date.now(), result: null };
    startRound(0);
  }
  start();

  const freed = (chain, b) => !chain.isFiber
    && (b === 0 || chain.bonds[b - 1]) && (b === chain.bonds.length || chain.bonds[b]);

  function chainRow(chain, ci) {
    let html = '';
    for (let b = 0; b <= chain.bonds.length; b++) {
      html += bead(chain.isFiber, freed(chain, b));
      if (b < chain.bonds.length) {
        html += chain.bonds[b]
          ? '<span class="bond cut" aria-label="Cut bond">✨</span>'
          : `<button class="bond ${chain.isFiber ? 'beta' : 'alpha'}" data-action="cut" data-chain="${ci}" data-bond="${b}"
              ${s.roundDone ? 'disabled' : ''} aria-label="${chain.isFiber ? 'Fiber beta bond' : 'Starch alpha bond'}"><i>${chain.isFiber ? 'β' : 'α'}</i></button>`;
      }
    }
    return `<div class="bead-chain" data-chain-row="${ci}">${html}</div>`;
  }

  return {
    tab: 'play', world: 'g-scissors', title: 'Enzyme Scissors', back: '#play',
    mount() { timer = setInterval(() => { const el = document.querySelector('[data-timer]'); if (el) el.textContent = `${elapsed()}s`; }, 1000); },
    destroy() { clearInterval(timer); },
    html() {
      if (s.result) {
        return summary('scissors', s.result, [
          'Amylase cuts the alpha bonds in starch, first in your mouth and then in the small intestine.',
          'Maltase splits maltose into two glucose molecules that can be absorbed.',
          "Fiber has beta bonds that human enzymes can't cut. Gut microbes ferment it into short-chain fatty acids instead!",
        ]);
      }
      const round = SCISSOR_ROUNDS[s.round];
      const glucose = s.chains.filter(c => !c.isFiber).reduce((n, c) => n + c.bonds.length + 1, 0);
      const hasFiber = s.chains.some(c => c.isFiber);
      return `<div class="stack game">
        ${hud(`<div><span class="eyebrow">Round ${s.round + 1} of ${SCISSOR_ROUNDS.length} · ${round.place}</span><h1 class="display xs">${esc(round.enzyme)}</h1></div>`,
          `${scoreBadge('Time', `${elapsed()}s`, '#2EC5E8').replace('<b>', '<b data-timer>')}${scoreBadge('Score', score(), '#FF8C42')}`)}
        ${speaker('amylase', s.message)}
        <div class="bead-board">${s.chains.map(chainRow).join('')}</div>
        <div class="legend-row">
          <span><i class="dot" style="background:#E76F51">α</i> Starch bond: CUT</span>
          <span><i class="dot" style="background:#2D6A4F">β</i> Fiber bond: SKIP</span>
        </div>
        ${s.roundDone ? `<div class="glass center stack-s pop">
          <h2 class="display xs">Round complete! 🍬</h2>
          <p class="muted">You freed ${glucose} glucose molecules for the body to absorb.${hasFiber ? ' The fiber slides on to feed your gut microbes. 🦠' : ''}</p>
          <button class="btn" style="--b:#FF8C42" data-action="advance">${s.round + 1 < SCISSOR_ROUNDS.length ? 'Next round' : 'See results'}</button>
        </div>` : ''}
      </div>`;
    },
    action(name, el) {
      if (name === 'replay') { start(); return app.rerender(true); }
      if (name === 'cut') {
        const ci = +el.dataset.chain;
        const chain = s.chains[ci];
        if (s.roundDone) return;
        if (chain.isFiber) {
          s.mistakes++;
          s.message = "Oops! That's fiber. Human enzymes can't cut beta bonds. Leave it for the gut microbes! 🦠";
          app.rerender();
          return shake(document.querySelector(`[data-chain-row="${ci}"]`));
        }
        sparkle(el, '#FFC83D');
        chain.bonds[+el.dataset.bond] = true;
        s.cuts++;
        s.message = pick(['Snip! ✂️', 'Nice cut!', 'Glucose freed! ⚡️', 'Sweet!', 'Keep snipping!']);
        if (s.chains.every(c => c.isFiber || c.bonds.every(Boolean))) s.roundDone = true;
        return app.rerender();
      }
      if (name === 'advance') {
        if (s.round + 1 < SCISSOR_ROUNDS.length) { startRound(s.round + 1); return app.rerender(true); }
        const final = score() + Math.max(0, 90 - elapsed()) * 2;
        s.result = finishRound('scissors', { title: 'Snip-tastic!', score: final, stars: final >= 300 ? 3 : final >= 220 ? 2 : 1 });
        return app.rerender(true);
      }
    },
  };
}

// MARK: - Fat Traffic Control

function carbonChain(carbons) {
  const width = 300;
  const height = 50;
  const step = Math.min(14, (width - 30) / Math.max(carbons - 1, 1));
  const startX = (width - step * (carbons - 1)) / 2;
  const pts = Array.from({ length: carbons }, (_, i) => [startX + i * step, height / 2 + (i % 2 === 0 ? -9 : 9)]);
  return `<svg class="carbon-chain" viewBox="0 0 ${width} ${height}" role="img" aria-label="${carbons} carbon chain">
    <polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#E0A800" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i ? 5 : 8}" fill="${i ? '#E0A800' : '#EF476F'}"/>`).join('')}
  </svg>`;
}

export function fatRouter(app) {
  const ROUNDS = 12;
  let s;
  const start = () => {
    s = { queue: shuffle(FAT_MOLECULES).slice(0, ROUNDS), index: 0, score: 0, streak: 0, correct: 0, feedback: null, outcome: null };
  };
  start();

  return {
    tab: 'play', world: 'g-fatRouter', title: 'Fat Traffic Control', back: '#play',
    html() {
      if (s.outcome) return summary('fatRouter', s.outcome, ['short', 'medium', 'long'].map(r => FAT_ROUTES[r].explanation));
      const fat = s.queue[s.index];
      const route = FAT_ROUTES[routeForCarbons(fat.carbons)];
      const fb = s.feedback;
      return `<div class="stack game">
        ${hud(`<div><span class="eyebrow">Fat ${s.index + 1} of ${ROUNDS}</span>${bar((s.index + 1) / ROUNDS, '#F4B400')}</div>`,
          `${s.streak >= 2 ? scoreBadge('Streak', `🔥${s.streak}`, '#FF595E') : ''}${scoreBadge('Score', s.score, '#F4B400')}`)}
        <div class="glass center stack-s fat-card" data-fat-card>
          <span class="eyebrow">Incoming fatty acid!</span>
          <h1 class="display">${esc(fat.name)}</h1>
          ${carbonChain(fat.carbons)}
          <b class="carbons">${fat.carbons} carbons long</b>
          <small class="muted">The red ball is the acid head. Count the carbons in the zig-zag tail!</small>
        </div>
        ${fb ? `<div class="glass stack-s pop">
            <h2 class="display xs ${fb.correct ? 'good' : 'bad'}">${fb.correct ? '✅ Correct route!' : `❌ Wrong way! It belongs on the ${esc(route.title)} ${route.emoji}`}</h2>
            <p>${esc(route.explanation)}</p>
            <p class="muted">💡 ${esc(fat.fact)}</p>
            <button class="btn" style="--b:#F4B400" data-action="next">${s.index + 1 < ROUNDS ? 'Next fat' : 'See results'}</button>
          </div>`
        : `<h2 class="display xs center">Where should it go?</h2>
          <div class="routes">${['short', 'medium', 'long'].map(id => {
            const r = FAT_ROUTES[id];
            return `<button class="route-btn" style="--b:${r.color}" data-action="route" data-route="${id}">
              <span class="route-emoji">${r.emoji}</span><span class="grow"><b>${r.title}</b><small>${r.rule}</small></span><span aria-hidden="true">➜</span></button>`;
          }).join('')}</div>`}
      </div>`;
    },
    action(name, el) {
      if (name === 'replay') { start(); return app.rerender(true); }
      if (name === 'route') {
        const fat = s.queue[s.index];
        const correct = el.dataset.route === routeForCarbons(fat.carbons);
        if (correct) {
          s.streak++;
          s.correct++;
          s.score += 10 + Math.min(s.streak - 1, 5) * 2;
          sparkle(el, '#5FD3A6');
        } else {
          s.streak = 0;
        }
        s.feedback = { correct };
        app.rerender();
        if (!correct) shake(document.querySelector('[data-fat-card]'));
        return;
      }
      if (name === 'next') {
        if (s.index + 1 < Math.min(ROUNDS, s.queue.length)) {
          s.feedback = null;
          s.index++;
        } else {
          const c = s.correct;
          s.outcome = finishRound('fatRouter', { title: `${c} of ${ROUNDS} fats routed!`, score: s.score, stars: c >= 11 ? 3 : c >= 8 ? 2 : c >= 4 ? 1 : 0 });
        }
        return app.rerender(true);
      }
    },
  };
}

// MARK: - Hormone Factory

export function hormoneFactory() {
  return {
    tab: 'play', world: 'g-factory', title: 'Hormone Factory', back: '#play',
    html() {
      const built = RECIPES.filter(r => store.hormoneStars(r.id) > 0).length;
      return `<div class="stack game">
        ${speaker('ribosome', `Welcome to the Hormone Factory! Pick an order, then choose the right starting molecule and helpers. ${built}/${RECIPES.length} built so far.`)}
        <div class="order-grid">${RECIPES.map(r => {
          const h = character(r.id);
          const n = store.hormoneStars(r.id);
          const loc = LOCATION[r.location];
          return `<a class="order${n ? ' built' : ''}" href="#hormone-${r.id}" style="--c:${h.color}">
            <span class="ticket-top">Order</span>
            ${pal(r.id, { size: 70, still: !n, mystery: n === 0 })}
            <b>${n ? esc(shortMolecule(h)) : '???'}</b><small>${loc.emoji} ${esc(loc.name)}</small>${stars(n, 3, 'xs')}</a>`;
        }).join('')}</div>
      </div>`;
    },
  };
}

export function hormoneBuild(app, id) {
  const r = findRecipe(id);
  if (!r) return null;
  const hormone = character(r.id);
  let s;
  let timers = [];
  const setUp = () => {
    timers.forEach(clearTimeout);
    timers = [];
    s = {
      stage: 'precursor', precursors: shuffle([r.precursor, ...r.wrongPrecursors]),
      helpers: shuffle([...r.helpers, ...r.wrongHelpers].map(helperToken)),
      selected: new Set(), mistakes: 0, hint: null, assembly: 0, earned: 0,
    };
  };
  setUp();

  const stepHeader = (n, text) =>
    `<div class="step-head"><span class="num" style="background:${hormone.color}">${n}</span><h2 class="display xs">${esc(text)}</h2></div>`;
  const hint = () => (s.hint ? `<p class="hint bad" role="status">${esc(s.hint)}</p>` : '');

  function runAssembly() {
    s.stage = 'assembling';
    s.assembly = 0;
    app.rerender();
    r.chain.forEach((_, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => { s.assembly = i; app.rerender(); }, i * 1100));
    });
    timers.push(setTimeout(() => {
      s.earned = s.mistakes === 0 ? 3 : s.mistakes <= 2 ? 2 : 1;
      const gained = store.awardHormone(r.id, s.earned);
      reward({ title: `${hormone.name} is ready!`, emoji: '🧪', stars: s.earned, gained, color: hormone.color });
      store.collect(r.id);
      r.chain.forEach(c => store.collect(c));
      s.stage = 'done';
      app.rerender();
    }, r.chain.length * 1100));
  }

  const loc = LOCATION[r.location];
  return {
    tab: 'play', world: 'g-factory', title: `Build ${firstName(hormone)}`, back: '#game-factory',
    destroy() { timers.forEach(clearTimeout); },
    html() {
      const ticket = `<div class="glass ticket">${pal(r.id, { size: 70, still: s.stage !== 'done', mystery: s.stage !== 'done' && !store.isCollected(r.id) })}
        <div class="grow"><span class="eyebrow">Order up!</span><h1 class="display xs">${esc(hormone.molecule)}</h1>
        <small class="muted">Made in: ${loc.emoji} ${esc(loc.name)}</small></div></div>`;
      let body = '';
      if (s.stage === 'precursor') {
        body = `${stepHeader(1, 'Pick the starting molecule')}
          <div class="grid two" data-shake>${s.precursors.map(pid => `<button class="pick" data-action="precursor" data-id="${pid}">
            ${pal(pid, { size: 60, still: true, shadow: false })}<b>${esc(shortMolecule(character(pid)))}</b></button>`).join('')}</div>${hint()}`;
      } else if (s.stage === 'helpers') {
        const ready = s.selected.size === r.helpers.length;
        body = `${stepHeader(2, `Pick ${r.helpers.length} helpers the enzymes need`)}
          <div class="picked-note good">${pal(r.precursor, { size: 40, still: true, shadow: false })} Starting with ${esc(firstName(character(r.precursor)))} ✓</div>
          <div class="grid two" data-shake>${s.helpers.map(t => {
            const on = s.selected.has(t.id);
            return `<button class="token${on ? ' on' : ''}" style="--b:${hormone.color}" aria-pressed="${on}" data-action="toggle" data-id="${t.id}">
              <span class="token-emoji">${t.emoji}</span><b>${esc(t.name)}</b></button>`;
          }).join('')}</div>${hint()}
          <button class="btn big" style="--b:${hormone.color}" data-action="check" ${ready ? '' : 'disabled'}>⚙️ Start the machine!</button>`;
      } else if (s.stage === 'assembling') {
        const cur = r.chain[s.assembly];
        body = `<div class="glass center stack assembly">${stepHeader(3, 'Assembly line running...')}
          <div class="gears" style="color:${hormone.color}" aria-hidden="true"><span>⚙</span><span>⚙</span><span>⚙</span></div>
          <div class="pop">${pal(cur, { size: 140, excited: true })}</div>
          <h2 class="display xs">${esc(character(cur).name)}</h2>
          <div class="segments">${r.chain.map((_, i) => `<span style="background:${i <= s.assembly ? hormone.color : 'rgba(31,36,71,.12)'}"></span>`).join('')}</div>
        </div>`;
      } else {
        body = `<div class="glass center stack pop">
          <h2 class="display xs">${esc(hormone.name)} is ready! 🎉</h2>${stars(s.earned, 3, 'big')}
          ${transformationChain(r.chain, 50)}
          <p class="left">${esc(r.lesson)}</p>
          <p class="strong" style="color:${hormone.color}">“${esc(hormone.catchphrase)}”</p>
          <div class="row buttons"><button class="btn ghost" data-action="again">↻ Again</button>
          <a class="btn" style="--b:${hormone.color}" href="#game-factory">More orders</a></div>
        </div>`;
      }
      return `<div class="stack game">${ticket}${body}</div>`;
    },
    action(name, el) {
      if (name === 'again') { setUp(); return app.rerender(true); }
      if (name === 'precursor') {
        if (el.dataset.id === r.precursor) {
          sparkle(el, '#5FD3A6');
          s.hint = null;
          s.stage = 'helpers';
          return app.rerender();
        }
        s.mistakes++;
        const wrong = character(el.dataset.id);
        s.hint = `Not this one! ${firstName(wrong)} usually becomes ${wrong.becomes[0] || 'something else'}. Think about what ${firstName(hormone)} is built from.`;
        app.rerender();
        return shake(document.querySelector('[data-shake]'));
      }
      if (name === 'toggle') {
        const tid = el.dataset.id;
        if (s.selected.has(tid)) s.selected.delete(tid);
        else if (s.selected.size < r.helpers.length) s.selected.add(tid);
        return app.rerender();
      }
      if (name === 'check') {
        const wrong = [...s.selected].filter(t => !r.helpers.includes(t));
        if (wrong.length) {
          s.mistakes++;
          s.hint = `The enzymes don't use ${wrong.map(t => helperToken(t).name).sort().join(', ')} for this job. Try again!`;
          wrong.forEach(t => s.selected.delete(t));
          app.rerender();
          return shake(document.querySelector('[data-shake]'));
        }
        s.hint = null;
        return runAssembly();
      }
    },
  };
}

// MARK: - Ribosome Rush

export function ribosomeRush(app) {
  let s;
  function startLevel(i) {
    const level = PEPTIDES[i];
    Object.assign(s, {
      level: i, placed: 0, mistakes: 0, done: false,
      palette: shuffle([...new Set([...level.sequence, ...level.decoys])]),
      message: 'Read the mRNA recipe and tap the amino acids in order. The glowing circle shows the next spot!',
    });
  }
  const start = () => { s = { total: 0, outcome: null }; startLevel(0); };
  start();

  return {
    tab: 'play', world: 'g-proteinBuilder', title: 'Ribosome Rush', back: '#play',
    html() {
      if (s.outcome) {
        return summary('proteinBuilder', s.outcome, [
          'Ribosomes link amino acids in the exact order written in your DNA (copied into mRNA).',
          "Nine amino acids are essential (⭐): your body can't make them, so they must come from food.",
          'Many hormones, like insulin, oxytocin and vasopressin, are just short chains of amino acids!',
        ]);
      }
      const level = PEPTIDES[s.level];
      const seq = [...level.sequence];
      return `<div class="stack game">
        ${hud(`<div><span class="eyebrow">Level ${s.level + 1} of ${PEPTIDES.length}</span><h1 class="display xs">${level.emoji} ${esc(level.name)}</h1></div>`,
          scoreBadge('Score', s.total, '#00A6C8'))}
        ${speaker('ribosome', s.message)}
        <div class="glass" data-shake><span class="eyebrow">mRNA recipe</span>
          <div class="flow slots">${seq.map((code, i) => {
            const a = amino(code);
            const filled = i < s.placed;
            const next = i === s.placed && !s.done;
            return `<span class="slot${filled ? ' filled' : ''}${next ? ' next' : ''}" style="--c:${a.color}">
              <span class="ball">${a.short}</span><span class="marker">${next ? '🏭' : ''}</span></span>`;
          }).join('')}</div></div>
        ${s.done ? `<div class="glass center stack pop">
            <h2 class="display xs">${esc(level.name)} built! 🎉</h2><p class="left">${esc(level.fact)}</p>
            <button class="btn" style="--b:#00A6C8" data-action="next">${s.level + 1 < PEPTIDES.length ? 'Next protein' : 'See results'}</button></div>`
        : `<div class="glass"><span class="eyebrow">Amino acid supply · ⭐ = essential</span>
            <div class="grid aminos">${s.palette.map(code => {
              const a = amino(code);
              return `<button class="amino" style="--b:${a.color}" data-action="tap" data-code="${code}" aria-label="${a.name}${a.essential ? ', essential' : ''}">
                <b>${a.short}${a.essential ? '⭐' : ''}</b><small>${a.name}</small></button>`;
            }).join('')}</div></div>`}
      </div>`;
    },
    action(name, el) {
      if (name === 'replay') { start(); return app.rerender(true); }
      if (name === 'tap') {
        const seq = [...PEPTIDES[s.level].sequence];
        if (s.done || s.placed >= seq.length) return;
        const expected = amino(seq[s.placed]);
        const a = amino(el.dataset.code);
        if (a.code === expected.code) {
          sparkle(el, a.color);
          s.placed++;
          s.message = a.essential
            ? `${a.name} linked! ⭐ It's essential, so it has to come from food.`
            : `${a.name} linked! Your body can make this one itself.`;
          if (s.placed === seq.length) {
            s.total += Math.max(30, 100 - s.mistakes * 10);
            s.done = true;
          }
          return app.rerender();
        }
        s.mistakes++;
        s.message = `Oops, that's ${a.name}. The recipe needs ${expected.name} (${expected.short}) next!`;
        app.rerender();
        return shake(document.querySelector('[data-shake]'));
      }
      if (name === 'next') {
        if (s.level + 1 < PEPTIDES.length) startLevel(s.level + 1);
        else s.outcome = finishRound('proteinBuilder', { title: 'Protein factory champion!', score: s.total, stars: s.total >= 450 ? 3 : s.total >= 350 ? 2 : 1 });
        return app.rerender(true);
      }
    },
  };
}

// MARK: - Molecule Quiz

export function quiz(app) {
  const COUNT = 10;
  let s;
  const start = () => { s = { questions: shuffle(QUIZ_BANK).slice(0, COUNT), index: 0, correct: 0, card: {}, outcome: null }; };
  start();

  return {
    tab: 'play', world: 'g-quiz', title: 'Molecule Quiz', back: '#play',
    html() {
      if (s.outcome) {
        return summary('quiz', s.outcome, [
          "Carbs, fats and proteins are all broken into small pieces before they're absorbed.",
          'Vitamins and minerals are the helpers enzymes need to build hormones and make energy.',
          'Hormones are made from food molecules: amino acids, cholesterol, iodine and more!',
        ]);
      }
      const answered = s.card.picked != null;
      return `<div class="stack game">
        ${hud(`<div><span class="eyebrow">Question ${s.index + 1} of ${s.questions.length}</span>${bar((s.index + 1) / s.questions.length)}</div>`,
          scoreBadge('Correct', s.correct, '#2DC653'))}
        <div class="quiz-host">${pal('mito', { size: 96, excited: answered })}</div>
        ${questionCard(s.questions[s.index], s.card)}
        ${answered ? `<button class="btn big pop" data-action="next">${s.index + 1 < s.questions.length ? 'Next question' : 'See results'}</button>` : ''}
      </div>`;
    },
    answer(i, el) {
      if (s.card.picked != null) return;
      s.card.picked = s.card.choices[i];
      if (s.card.picked === s.questions[s.index].correct) {
        s.correct++;
        store.answeredCorrectly();
        sparkle(el, '#5FD3A6');
      }
      app.rerender();
    },
    action(name) {
      if (name === 'replay') { start(); return app.rerender(true); }
      if (name === 'next') {
        if (s.index + 1 < s.questions.length) {
          s.index++;
          s.card = {};
        } else {
          const c = s.correct;
          s.outcome = finishRound('quiz', { title: `${c} of ${s.questions.length} correct!`, score: c * 10, stars: c >= 9 ? 3 : c >= 7 ? 2 : c >= 4 ? 1 : 0 });
        }
        return app.rerender(true);
      }
    },
  };
}

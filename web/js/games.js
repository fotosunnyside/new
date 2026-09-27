// The five mini-games, ported from Games/*.swift with the same rules and scoring.
import {
  character, firstName, shortMolecule, LOCATION, RECIPES, recipe as findRecipe, helperToken,
  FAT_MOLECULES, FAT_ROUTES, routeForCarbons, PEPTIDES, amino, QUIZ_BANK, shuffle, pick,
} from './data.js';
import { store } from './store.js';
import {
  esc, face, bead, stars, pill, progress, scoreBadge, sectionHeader, questionCard, gameOver,
  transformationChain, confetti, shake,
} from './ui.js';

const speaker = (id, message) =>
  `<div class="card row speaker">${face(id, { size: 54, excited: true })}<p class="grow" role="status">${esc(message)}</p></div>`;

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
        const cut = chain.bonds[b];
        html += cut
          ? '<span class="bond cut" aria-label="Cut bond">✨</span>'
          : `<button class="bond ${chain.isFiber ? 'beta' : 'alpha'}" data-action="cut" data-chain="${ci}" data-bond="${b}"
              ${s.roundDone ? 'disabled' : ''} aria-label="${chain.isFiber ? 'Fiber beta bond' : 'Starch alpha bond'}"><i>${chain.isFiber ? 'β' : 'α'}</i></button>`;
      }
    }
    return `<div class="bead-chain" data-chain-row="${ci}">${html}</div>`;
  }

  return {
    title: 'Enzyme Scissors', back: '#play', bg: 'sunset',
    mount() { timer = setInterval(() => { const el = document.querySelector('[data-timer]'); if (el) el.textContent = `${elapsed()}s`; }, 1000); },
    destroy() { clearInterval(timer); },
    html() {
      if (s.result) {
        return gameOver({ title: 'Snip-tastic!', ...s.result, lessons: [
          'Amylase cuts the alpha bonds in starch, first in your mouth and then in the small intestine.',
          'Maltase splits maltose into two glucose molecules that can be absorbed.',
          "Fiber has beta bonds that human enzymes can't cut. Gut microbes ferment it into short-chain fatty acids instead!",
        ] });
      }
      const round = SCISSOR_ROUNDS[s.round];
      const glucose = s.chains.filter(c => !c.isFiber).reduce((n, c) => n + c.bonds.length + 1, 0);
      const hasFiber = s.chains.some(c => c.isFiber);
      return `<div class="stack">
        <div class="row between top">
          <div><div class="eyebrow">Round ${s.round + 1} of ${SCISSOR_ROUNDS.length} · ${round.place}</div><h1 class="display sm">${esc(round.enzyme)}</h1></div>
          <div class="row gap-s">${scoreBadge('Time', `${elapsed()}s`, '#3A86FF').replace('<b>', '<b data-timer>')}${scoreBadge('Score', score(), '#FF8C42')}</div>
        </div>
        ${speaker('amylase', s.message)}
        <div class="bead-board">${s.chains.map(chainRow).join('')}</div>
        <div class="row gap legend">
          <span><i class="dot" style="background:#E76F51">α</i> Starch bond: CUT</span>
          <span><i class="dot" style="background:#2D6A4F">β</i> Fiber bond: SKIP</span>
        </div>
        ${s.roundDone ? `<div class="card center stack pop">
          <h2 class="display sm">Round complete! 🍬</h2>
          <p class="muted">You freed ${glucose} glucose molecules for the body to absorb.${hasFiber ? ' The fiber slides on to feed your gut microbes. 🦠' : ''}</p>
          <button class="bubble" style="--b:#FF8C42" data-action="advance">${s.round + 1 < SCISSOR_ROUNDS.length ? 'Next round' : 'See results'}</button>
        </div>` : ''}
      </div>`;
    },
    action(name, el) {
      if (name === 'replay') { start(); return app.rerender(); }
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
        chain.bonds[+el.dataset.bond] = true;
        s.cuts++;
        s.message = pick(['Snip! ✂️', 'Nice cut!', 'Glucose freed! ⚡️', 'Sweet!', 'Keep snipping!']);
        if (s.chains.every(c => c.isFiber || c.bonds.every(Boolean))) s.roundDone = true;
        return app.rerender();
      }
      if (name === 'advance') {
        if (s.round + 1 < SCISSOR_ROUNDS.length) { startRound(s.round + 1); return app.rerender(true); }
        const final = score() + Math.max(0, 90 - elapsed()) * 2;
        const count = final >= 300 ? 3 : final >= 220 ? 2 : 1;
        s.result = { score: final, stars: count, isNewBest: store.record('scissors', final, count) };
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
    title: 'Fat Traffic Control', back: '#play', bg: 'butter',
    html() {
      if (s.outcome) {
        return gameOver({ title: `${s.correct} of ${ROUNDS} fats routed!`, ...s.outcome,
          lessons: ['short', 'medium', 'long'].map(r => FAT_ROUTES[r].explanation) });
      }
      const fat = s.queue[s.index];
      const route = FAT_ROUTES[routeForCarbons(fat.carbons)];
      const fb = s.feedback;
      return `<div class="stack">
        <div class="row between">
          <span class="eyebrow">Fat ${s.index + 1} of ${ROUNDS}</span>
          <span class="row gap-s">${s.streak >= 2 ? scoreBadge('Streak', `🔥${s.streak}`, '#FF595E') : ''}${scoreBadge('Score', s.score, '#F4B400')}</span>
        </div>
        <div class="card center stack-s" data-fat-card>
          <span class="eyebrow">Incoming fatty acid!</span>
          <h1 class="display">${esc(fat.name)}</h1>
          ${carbonChain(fat.carbons)}
          <b class="carbons">${fat.carbons} carbons long</b>
          <small class="muted">The red ball is the acid head. Count the carbons in the zig-zag tail!</small>
        </div>
        ${fb ? `<div class="card stack-s pop">
            <h2 class="display xs ${fb.correct ? 'good' : 'bad'}">${fb.correct ? '✅ Correct route!' : `❌ Wrong way! It belongs on the ${esc(route.title)} ${route.emoji}`}</h2>
            <p>${esc(route.explanation)}</p>
            <p class="muted">💡 ${esc(fat.fact)}</p>
            <button class="bubble" style="--b:#F4B400" data-action="next">${s.index + 1 < ROUNDS ? 'Next fat' : 'See results'}</button>
          </div>`
        : `<h2 class="display xs center">Where should it go?</h2>
          ${['short', 'medium', 'long'].map(id => {
            const r = FAT_ROUTES[id];
            return `<button class="route" style="--b:${r.color}" data-action="route" data-route="${id}">
              <span class="route-emoji">${r.emoji}</span><span class="grow"><b>${r.title}</b><small>${r.rule}</small></span><span aria-hidden="true">➜</span></button>`;
          }).join('')}`}
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
          const count = c >= 11 ? 3 : c >= 8 ? 2 : c >= 4 ? 1 : 0;
          s.outcome = { score: s.score, stars: count, isNewBest: store.record('fatRouter', s.score, count) };
        }
        return app.rerender(true);
      }
    },
  };
}

// MARK: - Hormone Factory

export function hormoneFactory() {
  return {
    title: 'Hormone Factory', back: '#play', bg: 'night',
    html() {
      return `<div class="stack">
        <div class="card row speaker">${face('ribosome', { size: 60, excited: true })}
          <p class="grow">Welcome to the Hormone Factory! Pick an order, then choose the right starting molecule and helpers.</p></div>
        <div class="grid tiles-150">${RECIPES.map(r => {
          const h = character(r.id);
          const n = store.hormoneStars(r.id);
          const loc = LOCATION[r.location];
          return `<a class="tile" href="#hormone-${r.id}">
            ${face(r.id, { size: 70, animated: n > 0, silhouette: n === 0 })}
            <b>${esc(shortMolecule(h))}</b><small class="muted">${loc.emoji} ${esc(loc.name)}</small>${stars(n, 3, 13)}</a>`;
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
    `<div class="row gap-s step-head"><span class="num" style="background:${hormone.color}">${n}</span><h2 class="display xs">${esc(text)}</h2></div>`;
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
      store.awardHormone(r.id, s.earned);
      store.collect(r.id);
      r.chain.forEach(c => store.collect(c));
      s.stage = 'done';
      app.rerender();
      confetti();
    }, r.chain.length * 1100));
  }

  const loc = LOCATION[r.location];
  return {
    title: `Build ${firstName(hormone)}`, back: '#game-factory', bg: 'tint', tint: hormone.color,
    destroy() { timers.forEach(clearTimeout); },
    html() {
      const ticket = `<div class="card row">${face(r.id, { size: 70, animated: s.stage === 'done', silhouette: s.stage !== 'done' })}
        <div class="grow"><div class="eyebrow">Order up!</div><h1 class="display sm">${esc(hormone.molecule)}</h1>
        <small class="muted">Made in: ${loc.emoji} ${esc(loc.name)}</small></div></div>`;
      let body = '';
      if (s.stage === 'precursor') {
        body = `${stepHeader(1, 'Pick the starting molecule')}
          <div class="grid two" data-shake>${s.precursors.map(pid => `<button class="tile" data-action="precursor" data-id="${pid}">
            ${face(pid, { size: 60, animated: false })}<b>${esc(shortMolecule(character(pid)))}</b></button>`).join('')}</div>${hint()}`;
      } else if (s.stage === 'helpers') {
        const ready = s.selected.size === r.helpers.length;
        body = `${stepHeader(2, `Pick ${r.helpers.length} helpers the enzymes need`)}
          <div class="row gap-s good strong">${face(r.precursor, { size: 44, animated: false })} Starting with ${esc(firstName(character(r.precursor)))} ✓</div>
          <div class="grid two" data-shake>${s.helpers.map(t => {
            const on = s.selected.has(t.id);
            return `<button class="token${on ? ' on' : ''}" style="--b:${hormone.color}" aria-pressed="${on}" data-action="toggle" data-id="${t.id}">
              <span class="token-emoji">${t.emoji}</span><b>${esc(t.name)}</b></button>`;
          }).join('')}</div>${hint()}
          <button class="bubble" style="--b:${hormone.color}" data-action="check" ${ready ? '' : 'disabled'}>⚙️ Start the machine!</button>`;
      } else if (s.stage === 'assembling') {
        const cur = r.chain[s.assembly];
        body = `<div class="card center stack">${stepHeader(3, 'Assembly line running...')}
          <div class="gears" style="color:${hormone.color}" aria-hidden="true"><span>⚙</span><span>⚙</span><span>⚙</span></div>
          <div class="pop" key="${s.assembly}">${face(cur, { size: 140, excited: true })}</div>
          <h2 class="display sm">${esc(character(cur).name)}</h2>
          <div class="segments">${r.chain.map((_, i) => `<span style="background:${i <= s.assembly ? hormone.color : '#DADCE3'}"></span>`).join('')}</div>
        </div>`;
      } else {
        body = `<div class="card center stack pop">
          <h2 class="display sm">${esc(hormone.name)} is ready! 🎉</h2>${stars(s.earned, 3, 30)}
          ${transformationChain(r.chain, 50)}
          <p class="left">${esc(r.lesson)}</p>
          <p class="strong" style="color:${hormone.color}">“${esc(hormone.catchphrase)}”</p>
          <div class="row gap buttons"><button class="bubble white" data-action="again">↻ Again</button>
          <a class="bubble" style="--b:${hormone.color}" href="#game-factory">More orders</a></div>
        </div>`;
      }
      return `<div class="stack">${ticket}${body}</div>`;
    },
    action(name, el) {
      if (name === 'again') { setUp(); return app.rerender(true); }
      if (name === 'precursor') {
        if (el.dataset.id === r.precursor) {
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
    title: 'Ribosome Rush', back: '#play', bg: 'lagoon',
    html() {
      if (s.outcome) {
        return gameOver({ title: 'Protein factory champion!', ...s.outcome, lessons: [
          'Ribosomes link amino acids in the exact order written in your DNA (copied into mRNA).',
          "Nine amino acids are essential (⭐): your body can't make them, so they must come from food.",
          'Many hormones, like insulin, oxytocin and vasopressin, are just short chains of amino acids!',
        ] });
      }
      const level = PEPTIDES[s.level];
      const seq = [...level.sequence];
      return `<div class="stack">
        <div class="row between">
          <div><div class="eyebrow">Level ${s.level + 1} of ${PEPTIDES.length}</div><h1 class="display sm">${level.emoji} ${esc(level.name)}</h1></div>
          ${scoreBadge('Score', s.total, '#00A6C8')}
        </div>
        ${speaker('ribosome', s.message)}
        <div class="card" data-shake><div class="eyebrow">mRNA recipe</div>
          <div class="flow slots">${seq.map((code, i) => {
            const a = amino(code);
            const filled = i < s.placed;
            const next = i === s.placed && !s.done;
            return `<span class="slot${filled ? ' filled' : ''}${next ? ' next' : ''}" style="--c:${a.color}">
              <span class="ball">${a.short}</span><span class="marker">${next ? '🏭' : ''}</span></span>`;
          }).join('')}</div></div>
        ${s.done ? `<div class="card center stack pop">
            <h2 class="display sm">${esc(level.name)} built! 🎉</h2><p class="left">${esc(level.fact)}</p>
            <button class="bubble" style="--b:#00A6C8" data-action="next">${s.level + 1 < PEPTIDES.length ? 'Next protein' : 'See results'}</button></div>`
        : `<div class="card"><div class="eyebrow">Amino acid supply · ⭐ = essential</div>
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
        else {
          const count = s.total >= 450 ? 3 : s.total >= 350 ? 2 : 1;
          s.outcome = { score: s.total, stars: count, isNewBest: store.record('proteinBuilder', s.total, count) };
        }
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
    title: 'Molecule Quiz', back: '#play', bg: 'candy',
    html() {
      if (s.outcome) {
        return gameOver({ title: `${s.correct} of ${s.questions.length} correct!`, ...s.outcome, lessons: [
          "Carbs, fats and proteins are all broken into small pieces before they're absorbed.",
          'Vitamins and minerals are the helpers enzymes need to build hormones and make energy.',
          'Hormones are made from food molecules: amino acids, cholesterol, iodine and more!',
        ] });
      }
      const answered = s.card.picked != null;
      return `<div class="stack">
        <div class="row between"><span class="eyebrow">Question ${s.index + 1} of ${s.questions.length}</span>${scoreBadge('Correct', s.correct, 'var(--good)')}</div>
        ${progress((s.index + 1) / s.questions.length)}
        <div class="center">${face('mito', { size: 90, excited: answered })}</div>
        ${questionCard(s.questions[s.index], s.card)}
        ${answered ? `<button class="bubble pop" data-action="next">${s.index + 1 < s.questions.length ? 'Next question' : 'See results'}</button>` : ''}
      </div>`;
    },
    answer(i) {
      if (s.card.picked != null) return;
      s.card.picked = s.card.choices[i];
      if (s.card.picked === s.questions[s.index].correct) s.correct++;
      app.rerender();
    },
    action(name) {
      if (name === 'replay') { start(); return app.rerender(true); }
      if (name === 'next') {
        if (s.index + 1 < s.questions.length) {
          s.index++;
          s.card = {};
        } else {
          const score = s.correct * 10;
          const c = s.correct;
          const count = c >= 9 ? 3 : c >= 7 ? 2 : c >= 4 ? 1 : 0;
          s.outcome = { score, stars: count, isNewBest: store.record('quiz', score, count) };
        }
        return app.rerender(true);
      }
    },
  };
}

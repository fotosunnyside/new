// The arcade hub and the player profile.
import { GAMES, GAME_PALS, RECIPES, RANKS, CAST, PATHWAYS } from '../data.js';
import { store } from '../state/store.js';
import { player, journey } from '../state/progress.js';
import { esc } from '../ui/dom.js';
import { pal } from '../ui/pal.js';
import { ARCADE_SCENES, ICONS } from '../ui/art.js';
import { stars, questCard, badgeMedal, sectionTitle, palRow, progressRing, chip } from '../ui/components.js';

function cabinet(g) {
  const badge = store.badges.find(b => b.game === g.id);
  let stats;
  let pals;
  if (g.id === 'factory') {
    const built = RECIPES.filter(r => store.hormoneStars(r.id) > 0).length;
    stats = `${chip(`${built}/${RECIPES.length} built`, g.color, 'solid')}${stars(Math.round((RECIPES.reduce((n, r) => n + store.hormoneStars(r.id), 0) / (RECIPES.length * 3)) * 3), 3, 'sm')}`;
    pals = RECIPES.map(r => r.id);
  } else {
    const best = store.bestScore(g.id);
    stats = `${stars(store.gameStars(g.id), 3, 'sm')}<span class="best">${best !== undefined ? `Best ${best}` : 'No score yet'}</span>`;
    pals = GAME_PALS[g.id];
  }
  const unlock = badge && !badge.earned ? `<span class="unlock">${ICONS.lock} 3★ unlocks ${badge.emoji} ${esc(badge.title)}</span>` : '';
  return `<a class="cabinet" href="#game-${g.id}" style="--c:${g.color}">
    <span class="cab-scene">${ARCADE_SCENES[g.id]}<span class="cab-mascot">${pal(g.mascot, { size: 96, excited: true })}</span></span>
    <span class="cab-body">
      <b class="cab-title">${esc(g.title)}</b>
      <span class="cab-sub">${esc(g.subtitle)}</span>
      <span class="cab-stats">${stats}</span>
      ${unlock}
      <span class="cab-pals"><span class="eyebrow">Pals to discover</span>${palRow(pals.slice(0, 8), 24)}</span>
    </span>
    <span class="cab-play" aria-hidden="true">▶</span>
  </a>`;
}

export function arcade() {
  return {
    tab: 'play', world: 'arcade', title: 'Arcade',
    html() {
      const earned = store.badges.filter(b => b.earned).length;
      return `<div class="stack">
        <header class="screen-head rise"><h1 class="display">Arcade</h1><p>Play games, earn stars and discover the pals hiding in each one.</p></header>
        ${questCard()}
        <div class="cabinets">${GAMES.map(cabinet).join('')}</div>
        <section class="glass">${sectionTitle('Badges', `<a class="eyebrow link" href="#profile">${earned}/${store.badges.length} earned ›</a>`)}
          <div class="medals">${store.badges.map(badgeMedal).join('')}</div></section>
      </div>`;
    },
  };
}

export function profile(app) {
  let confirming = false;
  return {
    tab: 'play', world: 'arcade', title: 'Your Profile', back: 'history',
    html() {
      const p = player();
      const paths = PATHWAYS.filter(x => journey(x).done).length;
      const built = RECIPES.filter(r => store.hormoneStars(r.id) > 0).length;
      const stat = (v, l) => `<div class="stat"><b>${v}</b><small>${l}</small></div>`;
      return `<div class="stack">
        <header class="profile-head glass rise">
          ${progressRing(p.rankProgress, { size: 96, stroke: 7, color: 'var(--mango)', inner: `<span class="rank-emoji big">${p.rank.emoji}</span>` })}
          <div><span class="eyebrow">Your rank</span><h1 class="display sm">${esc(p.rank.title)}</h1>
            <p>${p.next ? `${p.toNext} more ⭐ to become ${esc(p.next.title)} ${p.next.emoji}` : "Top rank reached. You're a legend! 🎉"}</p></div>
        </header>
        <div class="stats">${stat(`${p.stars}/${p.maxStars}`, 'Stars')}${stat(`${p.pals}/${CAST.length}`, 'Pals')}${stat(`${paths}/${PATHWAYS.length}`, 'Adventures')}${stat(`${built}/${RECIPES.length}`, 'Hormones')}</div>
        <section class="glass">${sectionTitle('Rank ladder')}
          <ol class="ladder">${RANKS.map(r => {
            const state = p.stars >= r.minStars ? (r.title === p.rank.title ? 'current' : 'done') : 'next';
            return `<li class="${state}"><span class="lad-emoji">${r.emoji}</span><b>${esc(r.title)}</b><span>${r.minStars} ★</span></li>`;
          }).join('')}</ol></section>
        <section class="glass">${sectionTitle('Badges')}<div class="medals">${store.badges.map(badgeMedal).join('')}</div></section>
        <div class="reset">${confirming
          ? `<p class="strong">Reset all stars, scores and collected pals?</p>
             <div class="row buttons"><button class="btn danger" data-action="reset-yes">Reset everything</button>
             <button class="btn ghost" data-action="reset-no">Cancel</button></div>`
          : '<button class="text-btn" data-action="reset">Reset all progress</button>'}</div>
      </div>`;
    },
    action(name) {
      if (name === 'reset') confirming = true;
      if (name === 'reset-no') confirming = false;
      if (name === 'reset-yes') { store.reset(); confirming = false; }
      app.rerender();
    },
  };
}

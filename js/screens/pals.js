// Molecule Pals: the collection binder, pal profiles and mystery pals.
import { CAST, FAMILIES, FAMILY } from '../data.js';
import { store } from '../state/store.js';
import { palClues, palMastery, palPathways, palPlaces, whereToFind } from '../state/progress.js';
import { esc } from '../ui/dom.js';
import { pal } from '../ui/pal.js';
import { palCard, mysteryCard, progressRing, stars, sectionTitle, adventureTile, chip } from '../ui/components.js';
import { sparkle } from '../ui/fx.js';

export function collection(app) {
  let filter = null;
  return {
    tab: 'pals', world: 'vault', title: 'Molecule Pals',
    html() {
      const count = store.collectedCount;
      const shown = filter ? CAST.filter(c => c.family === filter) : CAST;
      const famCount = f => `${CAST.filter(c => c.family === f && store.isCollected(c.id)).length}/${CAST.filter(c => c.family === f).length}`;
      const filterChip = (id, label, color, extra = '') =>
        `<button class="filter${filter === id ? ' on' : ''}" style="--c:${color}" data-action="filter" data-id="${id ?? ''}" aria-pressed="${filter === id}">${label}${extra}</button>`;
      return `<div class="stack">
        <header class="collection-head glass rise">
          ${progressRing(count / CAST.length, { size: 84, stroke: 7, color: 'var(--pink)', inner: `<b>${count}</b><small>/${CAST.length}</small>` })}
          <div><h1 class="display sm">Molecule Pals</h1><p>Discover pals on adventures, in the arcade and in treasure chests. Every mystery card has a clue.</p></div>
        </header>
        <div class="filters" role="toolbar" aria-label="Filter by family">
          ${filterChip(null, '🌈 All', 'var(--navy)')}
          ${FAMILIES.map(f => filterChip(f.id, `${f.emoji} ${f.short}`, f.color, ` <small>${famCount(f.id)}</small>`)).join('')}
        </div>
        <div class="card-grid binder">${shown.map(c => (store.isCollected(c.id) ? palCard(c) : mysteryCard(c))).join('')}</div>
      </div>`;
    },
    action(name, el) {
      if (name === 'filter') { filter = el.dataset.id || null; app.rerender(); }
    },
  };
}

const niceDate = iso => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

export function palProfile(app, id) {
  const c = CAST.find(x => x.id === id);
  if (!c) return null;
  const fam = FAMILY[c.family];
  return {
    tab: 'pals', world: 'tint', tint: c.color, title: store.isCollected(id) ? c.name.split(' ')[0] : 'Mystery Pal', back: 'history',
    html() {
      return store.isCollected(id) ? known() : mystery();
    },
    action(name, el) {
      if (name === 'peek') { sparkle(el, c.color); store.collect(id); app.rerender(true); }
    },
  };

  function known() {
    const m = palMastery(id);
    const places = palPlaces(id);
    const paths = palPathways(id);
    const date = niceDate(store.collectedOn(id));
    const info = (title, body) => `<section class="info glass"><h2>${title}</h2>${body}</section>`;
    const tags = (list, cls = '') => `<div class="flow">${list.map(t => `<span class="tag ${cls}">${esc(t)}</span>`).join('')}</div>`;
    return `<div class="stack">
      <section class="pal-hero" style="--c:${c.color};--fc:${fam.color}">
        <span class="hero-rays"></span><span class="pedestal"></span>
        <span class="hero-pal pop">${pal(id, { size: 170, excited: true })}</span>
      </section>
      <div class="pal-title center rise">
        <h1 class="display">${esc(c.name)}</h1>
        <p class="muted">${esc(c.molecule)}</p>
        <div class="row center">${chip(`${fam.emoji} ${fam.title}`, fam.color, 'solid')}${date ? `<span class="muted small">Discovered ${date}</span>` : ''}</div>
      </div>
      <div class="speech glass"><p class="catch">“${esc(c.catchphrase)}”</p></div>
      ${m ? `<section class="mastery glass"><div><span class="eyebrow">Mastery</span><b>${m.done} of ${m.total} adventures complete</b></div>${stars(m.stars)}</section>` : ''}
      <div class="info-grid">
        ${info('What I do in the body', `<p>${esc(c.bio)}</p>`)}
        ${places.length ? info('Where I appear', `<div class="flow">${places.map(l => `<a class="tag link" href="#place-${l.id}" style="--c:${l.color}">${l.emoji} ${esc(l.name)}</a>`).join('')}</div>`) : ''}
        ${info('Find me in food', tags(c.foods, 'food'))}
        ${info('What I can become', tags(c.becomes, 'become'))}
        ${info('Fun fact', `<p class="strong">${esc(c.funFact)}</p>`)}
      </div>
      ${paths.length ? `${sectionTitle('My adventures')}<div class="tile-grid">${paths.map(p => adventureTile(p)).join('')}</div>` : ''}
    </div>`;
  }

  function mystery() {
    const clues = palClues(id);
    const where = whereToFind(id);
    return `<div class="stack">
      <section class="pal-hero mystery" style="--c:${c.color};--fc:${fam.color}">
        <span class="fog"></span><span class="pedestal"></span>
        <span class="hero-pal">${pal(id, { size: 170, mystery: true })}</span>
      </section>
      <div class="center rise"><h1 class="display">???</h1><p class="muted">An undiscovered Molecule Pal</p></div>
      <section class="clues glass">
        <h2>Clues</h2>
        <ol>${clues.map(cl => `<li><span aria-hidden="true">🔎</span>${esc(cl)}</li>`).join('')}</ol>
      </section>
      ${where ? `<a class="btn big" href="${where.href}">Go find it: ${esc(where.label)} ➜</a>` : ''}
      <button class="btn ghost" data-action="peek">Can't wait? Peek now</button>
    </div>`;
  }
}

/** Meeting a pal from a helper chip discovers it, then shows its profile. */
export function meet(app, id) {
  if (!CAST.some(c => c.id === id)) return null;
  store.collect(id);
  return { redirect: `#pal-${id}`, replace: true };
}

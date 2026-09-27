// Illustrations: the body world, organs, the cell, arcade cabinets and navigation icons.
// Organs are drawn on the same 200 × 320 grid as the hotspot positions in data.js.

// MARK: - Body

const BODY_PARTS = `
  <ellipse cx="100" cy="38" rx="26" ry="30"/>
  <rect x="89" y="60" width="22" height="30" rx="9"/>
  <path d="M72 86Q100 80 128 86Q143 90 143 106L139 150Q135 176 133 196Q137 208 135 220L65 220Q63 208 67 196Q65 176 61 150L57 106Q57 90 72 86Z"/>
  <path d="M60 92Q47 96 45 112L39 168Q36 200 34 236Q33 250 41 251Q49 251 49 238L54 190Q57 168 61 148Z"/>
  <path d="M140 92Q153 96 155 112L161 168Q164 200 166 236Q167 250 159 251Q151 251 151 238L146 190Q143 168 139 148Z"/>
  <path d="M67 210L100 210L98 242Q96 272 94 302Q93 314 83 314Q71 314 73 302Q71 270 69 242Z"/>
  <path d="M133 210L100 210L102 242Q104 272 106 302Q107 314 117 314Q129 314 127 302Q129 270 131 242Z"/>`;

/** Organ drawings keyed by location id. `box` frames the organ when you dive into it. */
export const ORGANS = {
  kidney: { color: '#B5838D', box: [52, 150, 56, 56], svg: `
    <path d="M72 166Q81 166 81 177Q81 182 77 182Q76 186 78 188Q76 192 71 192Q63 191 63 178Q63 166 72 166Z"/>
    <path d="M128 166Q119 166 119 177Q119 182 123 182Q124 186 122 188Q124 192 129 192Q137 191 137 178Q137 166 128 166Z"/>` },
  adrenal: { color: '#FF006E', box: [108, 146, 44, 44], svg: `
    <path d="M65 168Q71 157 79 167Q72 171 65 168Z"/><path d="M135 168Q129 157 121 167Q128 171 135 168Z"/>` },
  lymph: { color: '#52B788', box: [56, 80, 56, 64], stroke: true, svg: `
    <path d="M84 94Q81 120 86 150Q89 172 91 198M84 94Q76 90 68 94M84 94Q92 88 98 90M86 130Q76 132 70 138" fill="none" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="68" cy="94" r="2.6"/><circle cx="84" cy="96" r="3"/><circle cx="98" cy="90" r="2.2"/><circle cx="70" cy="138" r="2.4"/><circle cx="87" cy="152" r="2.4"/><circle cx="91" cy="196" r="2.6"/>` },
  bloodstream: { color: '#E63946', box: [78, 84, 60, 60], svg: `
    <path d="M100 96L100 214M100 98Q84 92 62 104M100 98Q116 92 138 104M100 214L86 232M100 214L114 232" fill="none" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>
    <path d="M111 124C99 116 98 104 105 103C108.5 103 110.5 106 111 108C111.5 106 113.5 103 117 103C124 104 123 116 111 124Z"/>` },
  liver: { color: '#A0522D', box: [52, 110, 64, 58], svg: `
    <path d="M62 132Q66 121 85 121Q104 121 108 128Q110 136 100 144Q85 154 71 155Q60 153 62 132Z"/>` },
  stomach: { color: '#FF9F1C', box: [98, 110, 50, 58], svg: `
    <path d="M106 124Q110 117 118 119Q135 123 137 140Q137 157 122 161Q107 163 104 154Q104 147 112 147Q121 146 121 138Q121 131 112 131Q105 130 106 124Z"/>` },
  pancreas: { color: '#F4B400', box: [80, 142, 56, 38], svg: `
    <path d="M87 163Q95 154 112 156Q124 157 129 153Q132 160 125 164Q108 167 96 169Q85 169 87 163Z"/>` },
  largeIntestine: { color: '#80B918', box: [70, 166, 62, 56], stroke: true, svg: `
    <path d="M80 212L80 184Q80 175 89 175L111 175Q120 175 120 184L120 207Q120 213 112 213L104 213" fill="none" stroke-width="7" stroke-linecap="round"/>
    <path d="M80 208L80 184Q80 178 88 178L112 178Q117 178 117 184L117 206" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="3 4"/>` },
  smallIntestine: { color: '#F4845F', box: [78, 172, 46, 46], stroke: true, svg: `
    <path d="M89 185Q100 180 111 185Q116 189 111 193Q100 189 89 193Q84 197 89 201Q100 197 111 201Q116 205 110 207Q100 205 92 207" fill="none" stroke-width="4.6" stroke-linecap="round"/>` },
  thyroid: { color: '#9B5DE5', box: [80, 62, 40, 34], svg: `
    <ellipse cx="95" cy="78" rx="4.6" ry="6.4"/><ellipse cx="105" cy="78" rx="4.6" ry="6.4"/><rect x="95" y="77" width="10" height="4" rx="2"/>` },
  reproductive: { color: '#F72585', box: [78, 204, 44, 40], svg: `
    <circle cx="90" cy="223" r="4"/><circle cx="110" cy="223" r="4"/>
    <path d="M90 223Q100 211 110 223" fill="none" stroke-width="2.2" stroke-linecap="round"/>` },
  bones: { color: '#AEB7C8', box: [60, 222, 48, 92], svg: `
    <path d="M84 228L86 262M86 270L86 304" fill="none" stroke-width="5" stroke-linecap="round"/>
    <circle cx="82" cy="227" r="3.4"/><circle cx="87" cy="227" r="3.4"/><circle cx="84" cy="266" r="3.6"/><circle cx="89" cy="266" r="3.4"/><circle cx="86" cy="305" r="3.4"/>` },
  muscle: { color: '#EF476F', box: [96, 216, 44, 64], svg: `
    <path d="M117 226Q128 246 119 268Q108 247 117 226Z"/>
    <path d="M117 232Q121 247 118 262M114 238Q117 248 115 258" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".9"/>` },
  brain: { color: '#F08CAE', box: [70, 0, 60, 52], svg: `
    <path d="M78 34C72 28 76 17 86 17C88 10 98 9 102 13C108 8 120 11 120 19C128 20 130 31 122 35C120 43 110 43 106 39C102 44 94 44 90 39C84 42 78 41 78 34Z"/>
    <path d="M88 21Q93 27 88 33M101 15Q98 22 102 28Q98 34 100 39M112 19Q108 25 114 31" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.3" stroke-linecap="round"/>` },
  mouth: { color: '#FF7B9C', box: [80, 40, 40, 32], svg: `
    <path d="M91 56Q100 51 109 56Q100 62.5 91 56Z"/><path d="M92 56Q100 57.5 108 56" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>` },
  skin: { color: '#FFB703', box: [10, 60, 180, 220], svg: '' },
};

const LUNGS = `<g fill="#FFB3C1" opacity=".42">
  <path d="M93 96Q77 93 70 108Q66 125 72 133Q85 135 93 126Z"/><path d="M107 96Q123 93 130 108Q134 125 128 133Q115 135 107 126Z"/></g>`;
const GUT_TUBE = '<path d="M100 60L100 116Q101 124 108 127" fill="none" stroke="#FF9AAE" stroke-opacity=".45" stroke-width="3.6" stroke-linecap="round"/>';

/** Paths the traveling pals follow on the body world. */
export const TRAVEL_PATHS = {
  food: 'M100 58L100 114Q102 124 114 128Q126 132 124 146Q120 158 106 170Q98 180 100 192',
  blood: 'M100 98L100 208Q100 216 108 212Q126 204 133 150Q136 116 111 112Q103 104 100 98Z',
};

const ORDER = ['kidney', 'adrenal', 'lymph', 'bloodstream', 'liver', 'stomach', 'pancreas', 'largeIntestine',
  'smallIntestine', 'thyroid', 'reproductive', 'bones', 'muscle', 'brain', 'mouth'];

function organGroup(id, state) {
  const o = ORGANS[id];
  const attrs = o.stroke ? `stroke="${o.color}" fill="${o.color}"` : `fill="${o.color}" stroke="${o.color}"`;
  return `<g class="organ ${state || ''}" data-organ="${id}" ${attrs}>
    <g class="organ-glow" filter="url(#nq-glow)">${o.svg}</g><g class="organ-body">${o.svg}</g></g>`;
}

/**
 * The see-through body. `states` maps location id → discovery state; `focus` highlights one organ;
 * `travelers` is SVG markup for pals riding the travel paths.
 */
export function bodyWorld({ states = {}, focus = null, travelers = '', viewBox = '0 0 200 320' } = {}) {
  return `<svg class="body-world${focus ? ' has-focus' : ''}" viewBox="${viewBox}" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="nq-skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFF1EA"/><stop offset=".6" stop-color="#FFE0D6"/><stop offset="1" stop-color="#FFD2C8"/>
      </linearGradient>
      <radialGradient id="nq-core" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="#FFD1E3" stop-opacity=".9"/><stop offset="1" stop-color="#FFD1E3" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="aura" fill="#fff" filter="url(#nq-glow)" opacity=".7">${BODY_PARTS}</g>
    <g class="rim" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round">${BODY_PARTS}</g>
    <g class="skin${focus === 'skin' ? ' focus' : ''}${states.skin ? ` ${states.skin}` : ''}" fill="url(#nq-skin)">${BODY_PARTS}</g>
    <ellipse cx="100" cy="160" rx="46" ry="70" fill="url(#nq-core)" opacity=".55"/>
    ${LUNGS}${GUT_TUBE}
    ${ORDER.map(id => organGroup(id, `${states[id] || ''}${focus === id ? ' focus' : ''}`)).join('')}
    ${travelers}
  </svg>`;
}

/** A close-up of one organ inside the body, used as the backdrop when you dive in. */
export function organCloseup(loc) {
  if (loc === 'cell' || loc === 'mitochondria') return cellArt({ focus: loc });
  const o = ORGANS[loc];
  const [x, y, w, h] = o.box;
  const pad = loc === 'skin' ? 0 : Math.max(w, h) * 0.35;
  const size = Math.max(w, h) + pad * 2;
  const cx = x + w / 2;
  // Nudge the organ up so it sits above the title panel that covers the bottom of the scene.
  const cy = y + h / 2 + (loc === 'skin' ? 0 : size * 0.16);
  return bodyWorld({ focus: loc, viewBox: `${cx - size / 2} ${cy - size / 2} ${size} ${size}` });
}

// MARK: - Cell

/** A cell with its nucleus, ribosomes and mitochondria. */
export function cellArt({ focus = null } = {}) {
  const mito = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})" class="mito-shape">
    <ellipse rx="22" ry="12" fill="#FF7B7F" stroke="#fff" stroke-width="2"/>
    <path d="M-15 0L-10 -7L-5 7L0 -7L5 7L10 -7L15 0" fill="none" stroke="#FFE3E3" stroke-width="2" stroke-linejoin="round"/></g>`;
  const dots = [[48, 118], [58, 124], [150, 70], [142, 62], [120, 150], [112, 158], [70, 60], [160, 110], [88, 150]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('');
  return `<svg class="cell-art${focus ? ` focus-${focus}` : ''}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <defs><radialGradient id="nq-cyto" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#E4FBFF"/><stop offset="1" stop-color="#9DE6F7"/></radialGradient></defs>
    <circle cx="100" cy="100" r="92" fill="#fff" opacity=".5" filter="url(#nq-glow)"/>
    <circle cx="100" cy="100" r="88" fill="url(#nq-cyto)" stroke="#fff" stroke-width="3"/>
    <path d="M40 80Q52 70 60 82T80 84M128 40Q140 50 132 60T140 78M120 132Q132 124 140 134T158 136" fill="none" stroke="#7DD3E8" stroke-width="2.4" stroke-linecap="round"/>
    <g class="cell-nucleus"><circle cx="82" cy="92" r="30" fill="#B79CFF" stroke="#fff" stroke-width="2.5"/><circle cx="88" cy="86" r="9" fill="#8F6BF2"/></g>
    <g fill="#5E6AD2" class="ribosomes">${dots}</g>
    <g class="cell-mitos">${mito(138, 124, -24)}${mito(58, 146, 18)}${mito(146, 84, 30)}</g>
  </svg>`;
}

// MARK: - Icons

export const ICONS = {
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.6" r="2.6"/><path d="M8 8.6h8a1.6 1.6 0 0 1 1.6 1.7l-.6 5.1a1.4 1.4 0 0 1-1.4 1.2h-.6l-.5 4.8a1.2 1.2 0 0 1-1.2 1.1h-2.6a1.2 1.2 0 0 1-1.2-1.1l-.5-4.8H8.4A1.4 1.4 0 0 1 7 15.4l-.6-5.1A1.6 1.6 0 0 1 8 8.6Z"/></svg>',
  pathways: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.8 8.2 13.4 13.4 8.2 15.8 10.6 10.6Z"/></svg>',
  pals: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6 20.1 7.3v9.4L12 21.4 3.9 16.7V7.3Z"/><circle cx="9.2" cy="11.2" r="1.5" fill="var(--nav-ink, #fff)"/><circle cx="14.8" cy="11.2" r="1.5" fill="var(--nav-ink, #fff)"/><path d="M9.4 14.6q2.6 2 5.2 0" fill="none" stroke="var(--nav-ink, #fff)" stroke-width="1.5" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 6.5h9.6a5 5 0 0 1 4.9 4.2l.8 5a2.8 2.8 0 0 1-5 2l-1.9-2.4H8.4l-1.9 2.4a2.8 2.8 0 0 1-5-2l.8-5a5 5 0 0 1 4.9-4.2Z"/><path d="M7.6 9.4v3.8M5.7 11.3h3.8" stroke="var(--nav-ink, #fff)" stroke-width="1.6" stroke-linecap="round"/><circle cx="15.6" cy="10.2" r="1.1" fill="var(--nav-ink, #fff)"/><circle cx="17.6" cy="12.4" r="1.1" fill="var(--nav-ink, #fff)"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z"/></svg>',
  chest: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 13h22v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" fill="#C9772B"/><path d="M5 13a8 6 0 0 1 8-6h6a8 6 0 0 1 8 6Z" fill="#E8973F"/><path d="M5 13h22v3H5Z" fill="#FFC83D"/><rect x="13.5" y="14" width="5" height="6" rx="1.2" fill="#FFE08A" stroke="#9A5A1E"/><path d="M9 7.6V27M23 7.6V27" stroke="#FFC83D" stroke-width="2"/></svg>',
};

// MARK: - Arcade cabinets

/** Decorative scene for each game's cabinet. Faces are added by the caller. */
export const ARCADE_SCENES = {
  scissors: `<svg class="scene" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <circle cx="250" cy="30" r="60" fill="#fff" opacity=".18"/>
    <path d="M150 118h170" stroke="#E76F51" stroke-width="5" stroke-dasharray="14 18" stroke-linecap="round"/>
    ${[168, 206, 244, 282].map(x => `<polygon points="${x},104 ${x + 12},111 ${x + 12},125 ${x},132 ${x - 12},125 ${x - 12},111" fill="#FF9F1C" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`).join('')}
    <g transform="translate(236 30) rotate(35)" font-size="58"><text>✂️</text></g></svg>`,
  fatRouter: `<svg class="scene" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path d="M110 150Q200 60 320 70V150Z" fill="#5C6784"/><path d="M130 150Q205 88 320 94" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="12 12"/>
    <text x="190" y="104" font-size="30">🚌</text><text x="262" y="92" font-size="26">🏎️</text><text x="276" y="40" font-size="26">🦠</text></svg>`,
  factory: `<svg class="scene" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <circle cx="260" cy="40" r="46" fill="#fff" opacity=".16"/>
    <g class="gear-spin" transform="translate(262 46)"><path d="M0-26l6 0 2 7 6 3 6-4 5 5-4 6 3 6 7 2v7l-7 2-3 6 4 6-5 5-6-4-6 3-2 7h-7l-2-7-6-3-6 4-5-5 4-6-3-6-7-2v-7l7-2 3-6-4-6 5-5 6 4 6-3 2-7Z" fill="#fff" opacity=".35"/></g>
    <text x="178" y="130" font-size="46">🧪</text><text x="236" y="136" font-size="34">⚗️</text></svg>`,
  proteinBuilder: `<svg class="scene" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect x="140" y="112" width="200" height="16" rx="8" fill="#1F6F8B" opacity=".55"/>
    ${[160, 190, 220, 250, 280, 310].map((x, i) => `<circle cx="${x}" cy="100" r="12" fill="${['#FF99C8', '#3A86FF', '#00A6C8', '#FF595E', '#FF8C42', '#9B5DE5'][i]}" stroke="#fff" stroke-width="2.5"/>`).join('')}
    <path d="M160 100H310" stroke="#fff" stroke-width="3" opacity=".7"/></svg>`,
  quiz: `<svg class="scene" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path d="M250 0L200 150H300Z" fill="#fff" opacity=".16"/><path d="M300 0L270 150H330Z" fill="#fff" opacity=".12"/>
    <text x="200" y="64" font-size="40" fill="#fff" opacity=".85" font-weight="800">?</text><text x="262" y="120" font-size="54" fill="#fff" opacity=".6" font-weight="800">?</text>
    <text x="238" y="58" font-size="24">⭐</text></svg>`,
};

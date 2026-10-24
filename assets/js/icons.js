/*
 * icons.js — 컬러풀 인포그래픽 아이콘 (그라데이션 타일 + 상징 글리프)
 * render({glyph, grad}, cls): 둥근 사각 그라데이션 위에 흰 글리프.
 *   glyph: 유니코드/한자 문자, 또는 'svg:<...>' 형태의 흰색 라인아트.
 *   grad : GRADS 인덱스.
 */
(function (root) {
  'use strict';
  var GRADS = [
    ['#7b5cff', '#4a2fd6'], ['#ff6b9d', '#c13584'], ['#ffb547', '#ff7a45'], ['#2fd4a7', '#108a7a'],
    ['#4aa3ff', '#2a5fd6'], ['#ff5e7e', '#d61f4a'], ['#a06bff', '#6a2fd6'], ['#34d399', '#0e9f6e'],
    ['#fbbf24', '#d97706'], ['#f472b6', '#be185d'], ['#38bdf8', '#0369a1'], ['#fb7185', '#9f1239'],
    ['#c084fc', '#7c3aed'], ['#2dd4bf', '#0d9488'], ['#facc15', '#ca8a04'], ['#60a5fa', '#1d4ed8'],
    ['#fda4af', '#e11d48'], ['#818cf8', '#4338ca'], ['#4ade80', '#15803d'], ['#fcd34d', '#b45309'],
    ['#e879f9', '#a21caf'], ['#22d3ee', '#0e7490'], ['#f97316', '#c2410c'], ['#a3e635', '#4d7c0f'],
    ['#5eead4', '#0f766e'], ['#f0abfc', '#c026d3'], ['#93c5fd', '#2563eb'], ['#fca5a5', '#dc2626']
  ];

  // 흰색 라인아트 글리프(플래그십)
  var SVG = {
    pillars: '<g stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"><rect x="12" y="12" width="24" height="3.4" rx="1.4" fill="#fff" stroke="none"/><rect x="12" y="32.6" width="24" height="3.4" rx="1.4" fill="#fff" stroke="none"/><line x1="15" y1="16" x2="15" y2="32"/><line x1="21" y1="16" x2="21" y2="32"/><line x1="27" y1="16" x2="27" y2="32"/><line x1="33" y1="16" x2="33" y2="32"/></g>',
    hexagram: '<g fill="#fff"><rect x="15" y="13" width="18" height="2.8" rx="1"/><rect x="15" y="19" width="18" height="2.8" rx="1"/><rect x="15" y="25" width="7" height="2.8" rx="1"/><rect x="26" y="25" width="7" height="2.8" rx="1"/><rect x="15" y="31" width="7" height="2.8" rx="1"/><rect x="26" y="31" width="7" height="2.8" rx="1"/></g>',
    blossom: '<g fill="#fff">' + [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180, cx = 24 + 9 * Math.sin(r), cy = 24 - 9 * Math.cos(r); return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="6"/>'; }).join('') + '</g><circle cx="24" cy="24" r="3.4" fill="rgba(0,0,0,.25)"/>',
    sun: '<circle cx="24" cy="24" r="7" fill="#fff"/><g stroke="#fff" stroke-width="2" stroke-linecap="round">' + Array.from({ length: 8 }).map(function (_, i) { var a = i * 45 * Math.PI / 180, x1 = 24 + 12 * Math.cos(a), y1 = 24 + 12 * Math.sin(a), x2 = 24 + 16 * Math.cos(a), y2 = 24 + 16 * Math.sin(a); return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>'; }).join('') + '</g>',
    tarot: '<g><rect x="16" y="11" width="16" height="26" rx="2.5" fill="#fff"/><path d="M24 15 l1.5 4 4.2.3-3.3 2.6 1.1 4.1-3.5-2.3-3.5 2.3 1.1-4.1-3.3-2.6 4.2-.3z" fill="rgba(0,0,0,.3)"/></g>',
    rune: '<path d="M19 12 V36 M19 13 L31 23 M19 25 L31 15" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round"/>',
    wave: '<path d="M8 24 Q15 11 24 24 T40 24" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M8 29 Q15 37 22 29 T36 31" stroke="rgba(255,255,255,.55)" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    fork: '<g stroke="#fff" stroke-width="2.2" fill="#fff"><circle cx="12" cy="24" r="3" stroke="none"/><path d="M14 24 H24 M24 24 C30 24 30 13 37 13 M24 24 C30 24 30 24 37 24 M24 24 C30 24 30 35 37 35" fill="none"/><circle cx="38" cy="13" r="2.6" stroke="none"/><circle cx="38" cy="24" r="2.6" stroke="none"/><circle cx="38" cy="35" r="2.6" stroke="none"/></g>',
    dice: '<rect x="13" y="13" width="22" height="22" rx="5" fill="#fff"/><g fill="rgba(0,0,0,.35)"><circle cx="19" cy="19" r="2"/><circle cx="29" cy="19" r="2"/><circle cx="24" cy="24" r="2"/><circle cx="19" cy="29" r="2"/><circle cx="29" cy="29" r="2"/></g>',
    wheel: '<circle cx="24" cy="24" r="13" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="24" cy="24" r="4" fill="#fff"/><g stroke="#fff" stroke-width="1.6">' + Array.from({ length: 12 }).map(function (_, i) { var a = i * 30 * Math.PI / 180; return '<line x1="' + (24 + 9 * Math.cos(a)).toFixed(1) + '" y1="' + (24 + 9 * Math.sin(a)).toFixed(1) + '" x2="' + (24 + 13 * Math.cos(a)).toFixed(1) + '" y2="' + (24 + 13 * Math.sin(a)).toFixed(1) + '"/>'; }).join('') + '</g>',
    moon: '<path d="M30 12 a13 13 0 1 0 0 24 a10 10 0 0 1 0-24z" fill="#fff"/>',
    book: '<path d="M24 14 C20 11 13 11 10 12 V35 C13 34 20 34 24 37 C28 34 35 34 38 35 V12 C35 11 28 11 24 14 Z" fill="#fff"/><line x1="24" y1="14" x2="24" y2="37" stroke="rgba(0,0,0,.25)" stroke-width="1.6"/>',
    hand: '<path d="M18 36 V22 a2 2 0 014 0 V20 a2 2 0 014 0 V21 a2 2 0 014 0 V23 a2 2 0 014 0 V32 a6 6 0 01-6 6 h-6 a6 6 0 01-6-6 z" fill="#fff"/>',
    pyramid: '<path d="M24 12 L37 34 H11 Z" fill="#fff"/><path d="M24 12 L24 34 M24 12 L18 34 M24 12 L30 34" stroke="rgba(0,0,0,.2)" stroke-width="1.3"/>',
    compass: '<circle cx="24" cy="24" r="13" fill="none" stroke="#fff" stroke-width="2"/><path d="M24 15 L27 24 L24 33 L21 24 Z" fill="#fff"/><circle cx="24" cy="24" r="2.4" fill="rgba(0,0,0,.3)"/>',
    star: '<path d="M24 11 l3.6 9.3 9.9.5-7.7 6.2 2.6 9.6-8.4-5.3-8.4 5.3 2.6-9.6-7.7-6.2 9.9-.5z" fill="#fff"/>',
    leaf: '<path d="M14 34 C14 20 24 12 34 12 C34 26 24 34 14 34 Z" fill="#fff"/><path d="M16 32 C22 26 28 20 32 15" stroke="rgba(0,0,0,.25)" stroke-width="1.6" fill="none"/>',
    shell: '<path d="M24 13 C33 13 37 22 36 33 H12 C11 22 15 13 24 13 Z" fill="#fff"/><g stroke="rgba(0,0,0,.25)" stroke-width="1.4" fill="none"><path d="M24 14 V33 M18 15 L21 33 M30 15 L27 33"/></g>',
    chart: '<g fill="#fff"><rect x="12" y="26" width="5" height="10" rx="1"/><rect x="21" y="19" width="5" height="17" rx="1"/><rect x="30" y="14" width="5" height="22" rx="1"/></g>'
  };

  var FONT = 'font-family:\'Noto Serif KR\',Georgia,serif';

  var uid = 0;
  function render(spec, cls) {
    spec = spec || {};
    var g = GRADS[(spec.grad || 0) % GRADS.length];
    var id = 'ig' + (uid++);
    var glyph = spec.glyph || '✦';
    var inner;
    if (typeof glyph === 'string' && glyph.indexOf('svg:') === 0) inner = SVG[glyph.slice(4)] || '';
    else if (SVG[glyph]) inner = SVG[glyph];
    else {
      var fs = glyph.length > 1 ? 15 : 22;
      inner = '<text x="24" y="24" text-anchor="middle" dominant-baseline="central" fill="#fff" style="' + FONT + ';font-weight:700;font-size:' + fs + 'px">' + glyph + '</text>';
    }
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + g[0] + '"/><stop offset="1" stop-color="' + g[1] + '"/></linearGradient></defs>' +
      '<rect x="2" y="2" width="44" height="44" rx="13" fill="url(#' + id + ')"/>' +
      '<path d="M6 6 h36 a8 8 0 0 1 0 0 q-18 2 -36 14 v-6 a8 8 0 0 1 8-8z" fill="rgba(255,255,255,.16)"/>' +
      inner + '</svg>';
  }

  var logo = '<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7b45a"/><stop offset="1" stop-color="#b2832f"/></linearGradient></defs><circle cx="24" cy="24" r="21" fill="#171c30"/><path d="M24 6 L27.2 20.8 L42 24 L27.2 27.2 L24 42 L20.8 27.2 L6 24 L20.8 20.8 Z" fill="url(#lg)"/><circle cx="24" cy="24" r="3.4" fill="#8aa0e0"/></svg>';

  var api = { render: render, GRADS: GRADS, SVG: SVG, logo: logo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.icons = api;
})(typeof window !== 'undefined' ? window : globalThis);

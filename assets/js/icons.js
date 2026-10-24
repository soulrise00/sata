/*
 * icons.js — 체계별 인라인 SVG 아이콘 (이원색 라인 스타일)
 * stroke=currentColor(먹), fill=var(--accent)(호박) 조합. viewBox 0 0 48 48.
 */
(function (root) {
  'use strict';
  var S = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  var A = 'var(--accent)';

  var I = {
    logo: '<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" ' + S + '/>' +
      '<path d="M24 5 L27 21 L43 24 L27 27 L24 43 L21 27 L5 24 L21 21 Z" fill="' + A + '" stroke="' + A + '" stroke-width="1"/>' +
      '<circle cx="24" cy="24" r="3.4" fill="var(--cosmos)"/></svg>',

    // 사주 — 네 기둥
    saju: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="6" y="6" width="36" height="5" rx="1.5" fill="' + A + '"/>' +
      '<rect x="6" y="37" width="36" height="5" rx="1.5" fill="' + A + '"/>' +
      ['9', '19', '29', '39'].map(function (x) { return '<rect x="' + x + '" y="12" width="5" height="24" rx="1.5" ' + S + '/>'; }).join('') +
      '</svg>',

    // 주역 — 육효(상 건, 하 곤 예시)
    iching: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      [8, 15, 22].map(function (y) { return '<rect x="8" y="' + y + '" width="32" height="4.2" rx="1.5" fill="' + A + '"/>'; }).join('') +
      [29, 36, 43].map(function (y) { return '<rect x="8" y="' + y + '" width="14" height="4.2" rx="1.5" ' + S + ' fill="currentColor"/><rect x="26" y="' + y + '" width="14" height="4.2" rx="1.5" ' + S + ' fill="currentColor"/>'; }).join('') +
      '</svg>',

    // 매화역수 — 매화 꽃
    plum: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180; var cx = 24 + 11 * Math.sin(r), cy = 24 - 11 * Math.cos(r); return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="7.5" fill="' + A + '" opacity="0.85"/>'; }).join('') +
      '<circle cx="24" cy="24" r="4" fill="var(--cosmos)"/></svg>',

    // 서양 점성 — 태양+황도 링
    western: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="18" ' + S + '/><circle cx="24" cy="24" r="8" fill="' + A + '"/>' +
      Array.from({ length: 12 }).map(function (_, i) { var r = i * 30 * Math.PI / 180; var x1 = 24 + 15 * Math.cos(r), y1 = 24 + 15 * Math.sin(r), x2 = 24 + 18 * Math.cos(r), y2 = 24 + 18 * Math.sin(r); return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" ' + S + '/>'; }).join('') +
      '</svg>',

    // 타로 — 펼친 카드
    tarot: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<g transform="rotate(-16 24 30)"><rect x="7" y="12" width="16" height="24" rx="2.5" fill="var(--surface)" ' + S + '/></g>' +
      '<g transform="rotate(16 24 30)"><rect x="25" y="12" width="16" height="24" rx="2.5" fill="var(--surface)" ' + S + '/></g>' +
      '<rect x="16" y="9" width="16" height="26" rx="2.5" fill="' + A + '"/>' +
      '<path d="M24 14 l1.6 4.2 4.4.3 -3.4 2.8 1.2 4.3 -3.8-2.4 -3.8 2.4 1.2-4.3 -3.4-2.8 4.4-.3z" fill="var(--cosmos)"/></svg>',

    // 룬 — 룬돌
    runes: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="10" y="7" width="28" height="34" rx="8" fill="' + A + '" opacity=".9"/>' +
      '<path d="M19 12 V36 M19 13 L31 22 M19 25 L31 16" stroke="var(--cosmos)" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',

    // 르노르망 — 카드+클로버
    lenormand: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="11" y="7" width="26" height="34" rx="3" fill="var(--surface)" ' + S + '/>' +
      '<g fill="' + A + '"><circle cx="24" cy="19" r="4"/><circle cx="19" cy="24" r="4"/><circle cx="29" cy="24" r="4"/><circle cx="24" cy="29" r="4"/></g>' +
      '<rect x="23" y="29" width="2" height="7" fill="var(--cosmos)"/></svg>',

    // 수비학 — 원 안의 수
    numerology: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="18" ' + S + '/>' +
      '<text x="24" y="31" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="700" fill="' + A + '">7</text>' +
      '<circle cx="11" cy="12" r="1.6" fill="currentColor"/><circle cx="37" cy="12" r="1.6" fill="currentColor"/><circle cx="37" cy="36" r="1.6" fill="currentColor"/></svg>',

    // 생체리듬 — 사인파
    biorhythm: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<line x1="5" y1="24" x2="43" y2="24" stroke="var(--line-strong)" stroke-width="1.4"/>' +
      '<path d="M5 24 Q14 8 24 24 T43 24" stroke="' + A + '" stroke-width="2.2" fill="none"/>' +
      '<path d="M5 24 Q12 36 19 24 T33 24 T43 28" stroke="var(--modern)" stroke-width="2.2" fill="none"/></svg>',

    // 띠 — 십이지 원
    zodiac: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="18" ' + S + '/>' +
      Array.from({ length: 12 }).map(function (_, i) { var r = i * 30 * Math.PI / 180; var x = 24 + 18 * Math.cos(r), y = 24 + 18 * Math.sin(r); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.4" fill="' + (i % 3 === 0 ? A : 'currentColor') + '"/>'; }).join('') +
      '<text x="24" y="30" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="' + A + '">子</text></svg>',

    // 현대 포사이트 — 분기 경로
    foresight: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="10" cy="24" r="3.5" fill="' + A + '"/>' +
      '<path d="M13 24 H24 M24 24 C30 24 30 11 38 11 M24 24 C30 24 30 24 38 24 M24 24 C30 24 30 37 38 37" ' + S + '/>' +
      '<circle cx="24" cy="24" r="2.6" fill="var(--cosmos)"/>' +
      '<circle cx="40" cy="11" r="3" fill="currentColor"/><circle cx="40" cy="24" r="3" fill="currentColor"/><circle cx="40" cy="37" r="3" fill="currentColor"/></svg>',

    // 도감 — 책
    atlas: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<path d="M24 11 C19 7 11 7 7 9 V38 C11 36 19 36 24 40 C29 36 37 36 41 38 V9 C37 7 29 7 24 11 Z" fill="var(--surface)" ' + S + '/>' +
      '<line x1="24" y1="11" x2="24" y2="40" ' + S + '/>' +
      '<path d="M11 16 h8 M11 22 h8 M29 16 h8 M29 22 h8" stroke="' + A + '" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };

  function render(name, cls) {
    var svg = I[name] || I.atlas;
    if (cls) svg = svg.replace('class="ico"', 'class="ico ' + cls + '"').replace('class="logo"', 'class="logo ' + cls + '"');
    return svg;
  }

  var api = { set: I, render: render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.icons = api;
})(typeof window !== 'undefined' ? window : globalThis);

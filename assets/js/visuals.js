/*
 * visuals.js — 테마별 애니메이션 비주얼 컴포넌트 (HTML 문자열 생성)
 * 애니메이션 키프레임은 styles.css에 정의. 결과 렌더 시 자동 재생.
 */
(function (root) {
  'use strict';
  var FL = root.FL || {};

  // 주사위(두 개 이상) — 굴러가는 애니메이션 후 정착
  var PIPS = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]] };
  function die(v, i) {
    var pips = (PIPS[v] || PIPS[1]).map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#2a1f12"/>'; }).join('');
    return '<div class="die-roll" style="animation-delay:' + (i * 0.12) + 's"><svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="rgba(0,0,0,.15)"/>' + pips + '</svg></div>';
  }
  function dice(values) { return '<div class="dice-wrap">' + values.map(function (v, i) { return die(v, i); }).join('') + '</div>'; }

  // 카드(뒤집기)
  function cards(picks, positions, glyphFn, backLabel) {
    return '<div class="card-row">' + picks.map(function (pk, i) {
      var c = pk.card;
      return '<div class="flip-card" style="animation-delay:' + (i * 0.14) + 's"><div class="flip-inner">' +
        '<div class="flip-back"><span>' + (backLabel || '✦') + '</span></div>' +
        '<div class="flip-front card-face' + (pk.reversed ? ' rev' : '') + '">' +
        (positions ? '<div class="pos">' + esc(positions[i] || ('카드 ' + (i + 1))) + '</div>' : '') +
        '<div class="glyph">' + glyphFn(c) + '</div>' +
        '<div class="cname">' + esc(c.ko || c.name) + (pk.reversed ? ' <span style="color:var(--warn)">역</span>' : '') + '</div>' +
        '</div></div></div>';
    }).join('') + '</div>';
  }

  // 룬 돌(신비한 발광 등장)
  function runes(picks, positions) {
    return '<div class="rune-row">' + picks.map(function (pk, i) {
      var c = pk.card;
      return '<div class="rune-stone' + (pk.reversed ? ' rev' : '') + '" style="animation-delay:' + (i * 0.16) + 's">' +
        (positions ? '<div class="pos">' + esc(positions[i] || '') + '</div>' : '') +
        '<div class="rune-glyph">' + (c.rune || c.name) + '</div>' +
        '<div class="rune-name">' + esc(c.name) + (pk.reversed && c.canReverse ? ' (역)' : '') + '</div>' +
        '<div class="rune-kw">' + esc(c.kw || '') + '</div></div>';
    }).join('') + '</div>';
  }

  // 괘(아래→위 선이 그려지는 애니메이션)
  function hexagram(hex, movingIdx, animate) {
    movingIdx = movingIdx || [];
    var rows = '';
    for (var i = 5; i >= 0; i--) {
      var yin = hex.lines[i] === 0, moving = movingIdx.indexOf(i) >= 0;
      var delay = (5 - i) * 0.12;
      rows += '<div class="ln ' + (yin ? 'yin' : '') + (moving ? ' moving' : '') + (animate ? ' draw' : '') + '" style="animation-delay:' + delay + 's"><span></span><span class="mid"></span><span></span></div>';
    }
    return '<div class="hexline">' + rows + '</div>';
  }

  // 오행 발광 오브
  var ELEM_VAR = { '목': 'var(--e-wood)', '화': 'var(--e-fire)', '토': 'var(--e-earth)', '금': 'var(--e-metal)', '수': 'var(--e-water)' };
  function orbs(balance, ELEM) {
    var total = balance.reduce(function (a, b) { return a + b; }, 0) || 1;
    var han = ['木', '火', '土', '金', '水'];
    return '<div class="orb-row">' + ELEM.map(function (e, i) {
      var pct = balance[i] / total;
      var size = 34 + pct * 60;
      return '<div class="orb-item" style="animation-delay:' + (i * 0.1) + 's"><div class="orb" style="width:' + size.toFixed(0) + 'px;height:' + size.toFixed(0) + 'px;background:radial-gradient(circle at 35% 30%, #fff6, ' + ELEM_VAR[e] + ');box-shadow:0 0 18px ' + ELEM_VAR[e] + '66"></div><div class="orb-lab" style="color:' + ELEM_VAR[e] + '">' + e + ' ' + Math.round(pct * 100) + '%</div></div>';
    }).join('') + '</div>';
  }

  // 황도 바퀴(회전 후 정착) + 하이라이트 섹터
  function wheel(highlightIndex, labels) {
    var seg = labels.map(function (lab, i) {
      var a0 = i * 30 - 90, a1 = a0 + 30, mid = (a0 + a1) / 2;
      var x = 100 + 70 * Math.cos(mid * Math.PI / 180), y = 100 + 70 * Math.sin(mid * Math.PI / 180);
      var hl = i === highlightIndex;
      return '<text x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" text-anchor="middle" dominant-baseline="central" font-size="13" fill="' + (hl ? 'var(--accent)' : 'var(--ink-faint)') + '" font-weight="' + (hl ? '700' : '400') + '">' + lab + '</text>';
    }).join('');
    var spokes = labels.map(function (_, i) { var a = (i * 30 - 90) * Math.PI / 180; return '<line x1="100" y1="100" x2="' + (100 + 88 * Math.cos(a)).toFixed(0) + '" y2="' + (100 + 88 * Math.sin(a)).toFixed(0) + '" stroke="var(--line)" stroke-width="1"/>'; }).join('');
    return '<div class="wheel-wrap"><svg viewBox="0 0 200 200" class="zwheel"><circle cx="100" cy="100" r="88" fill="none" stroke="var(--line-strong)" stroke-width="2"/><circle cx="100" cy="100" r="55" fill="none" stroke="var(--line)" stroke-width="1"/>' + spokes + '<circle cx="100" cy="100" r="8" fill="var(--accent)"/>' + seg + '</svg></div>';
  }

  // 지오맨시 형상(4줄 점)
  function geoFigure(fig, label) {
    var rows = fig.bits.map(function (b) { return '<div class="geo-line">' + (b === 1 ? '<span class="dot"></span>' : '<span class="dot"></span><span class="dot"></span>') + '</div>'; }).join('');
    return '<div class="geo-fig"><div class="geo-dots">' + rows + '</div><div class="geo-name">' + esc(fig.ko) + '</div>' + (label ? '<div class="geo-lab">' + esc(label) + '</div>' : '') + '</div>';
  }

  // 확률 막대(채워지는 애니메이션)
  function probBar(central, band) {
    return '<div class="prob-track"><div class="prob-band fillw" style="left:' + band[0] + '%;--w:' + (band[1] - band[0]) + '%"></div><div class="prob-center" style="left:' + central + '%"></div></div>';
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  var api = { dice: dice, cards: cards, runes: runes, hexagram: hexagram, orbs: orbs, wheel: wheel, geoFigure: geoFigure, probBar: probBar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.visuals = api;
})(typeof window !== 'undefined' ? window : globalThis);

/*
 * oracle.js — 특수 추출: 지오맨시(실드)·주사위·예아니오
 */
(function (root) {
  'use strict';
  var cards = (typeof require !== 'undefined') ? require('./cards.js') : root.FL.cards;
  var OD = (typeof require !== 'undefined') ? require('../data/oracle-data.js') : root.FL.oracleData;

  function matchFigure(lines) {
    for (var i = 0; i < OD.GEOMANCY.length; i++) {
      var b = OD.GEOMANCY[i].bits;
      if (b[0] === lines[0] && b[1] === lines[1] && b[2] === lines[2] && b[3] === lines[3]) return OD.GEOMANCY[i];
    }
    return OD.GEOMANCY[0];
  }
  function combine(g, h) { return [0, 1, 2, 3].map(function (i) { return ((g[i] + h[i]) % 2 === 0) ? 2 : 1; }); }

  function geomancy(opts) {
    opts = opts || {};
    var seed = (opts.seed != null) ? opts.seed >>> 0 : cards.makeSeed();
    var rng = cards.mulberry32(seed);
    var mothers = [];
    for (var m = 0; m < 4; m++) { var l = []; for (var i = 0; i < 4; i++) l.push(rng() < 0.5 ? 1 : 2); mothers.push(l); }
    var daughters = [0, 1, 2, 3].map(function (i) { return [mothers[0][i], mothers[1][i], mothers[2][i], mothers[3][i]]; });
    var n1 = combine(mothers[0], mothers[1]), n2 = combine(mothers[2], mothers[3]);
    var n3 = combine(daughters[0], daughters[1]), n4 = combine(daughters[2], daughters[3]);
    var rw = combine(n1, n2), lw = combine(n3, n4), judge = combine(rw, lw);
    return {
      seed: seed,
      mothers: mothers.map(matchFigure),
      witnesses: [matchFigure(rw), matchFigure(lw)],
      judge: matchFigure(judge)
    };
  }

  function dice2(opts) {
    opts = opts || {};
    var seed = (opts.seed != null) ? opts.seed >>> 0 : cards.makeSeed();
    var rng = cards.mulberry32(seed);
    var d1 = Math.floor(rng() * 6) + 1, d2 = Math.floor(rng() * 6) + 1;
    return { seed: seed, dice: [d1, d2], sum: d1 + d2, reading: OD.DICE2[d1 + d2] };
  }

  var YESNO = {
    pendulum: [['예', '그렇다고 나옵니다. 다만 "지금/이 조건"에서의 예임을 기억하세요.'], ['아니오', '아니라고 나옵니다. 질문을 바꾸거나 때를 기다릴 신호.'], ['불분명', '진자가 머뭇거립니다 — 정보가 부족하거나 질문이 모호합니다.']],
    mo: [['길(吉)', '문수의 지혜가 긍정을 비춥니다. 선한 의도로 나아가세요.'], ['중(中)', '길흉이 섞였습니다 — 수행·준비를 더한 뒤 다시 물으세요.'], ['흉(凶)', '지금은 삼가라는 뜻. 더 큰 해를 피하는 보호로 읽으세요.']]
  };
  function yesno(setName, opts) {
    opts = opts || {};
    var set = YESNO[setName] || YESNO.pendulum;
    var seed = (opts.seed != null) ? opts.seed >>> 0 : cards.makeSeed();
    var rng = cards.mulberry32(seed);
    var pick = set[Math.floor(rng() * set.length)];
    return { seed: seed, answer: pick[0], reading: pick[1] };
  }

  var api = { geomancy: geomancy, dice2: dice2, yesno: yesno };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.oracle = api;
})(typeof window !== 'undefined' ? window : globalThis);

/*
 * cards.js — 카드/룬 추출 공통 엔진 (타로·룬·르노르망)
 * 원전 원칙: "유리한 결과가 나올 때까지 다시 뽑지 않는다."
 *   → 추출 시드(seed)를 기록해 같은 뽑기를 재현(R)할 수 있게 한다.
 */
(function (root) {
  'use strict';

  // mulberry32 seeded PRNG
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeSeed() { return (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0; }

  // deck: 배열, count: 뽑을 수, opts:{reversals:bool, seed:number, canReverseKey:'canReverse'}
  function draw(deck, count, opts) {
    opts = opts || {};
    var seed = (opts.seed != null) ? (opts.seed >>> 0) : makeSeed();
    var rng = mulberry32(seed);
    var idx = deck.map(function (_, i) { return i; });
    // Fisher–Yates
    for (var i = idx.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    var picks = [];
    for (var k = 0; k < count; k++) {
      var card = deck[idx[k]];
      var reversed = false;
      if (opts.reversals) {
        var allow = opts.canReverseKey ? card[opts.canReverseKey] !== false : true;
        reversed = allow && rng() < 0.5;
      }
      picks.push({ card: card, reversed: reversed });
    }
    return { seed: seed, picks: picks };
  }

  var api = { draw: draw, makeSeed: makeSeed, mulberry32: mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.cards = api;
})(typeof window !== 'undefined' ? window : globalThis);

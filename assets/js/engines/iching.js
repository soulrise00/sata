/*
 * iching.js — 주역 동전법 점(周易 擲錢法)
 * 원전 제1권 제3장: 동전 3개를 6번 던져 아래효부터 쌓는다.
 *   앞면=3, 뒷면=2.  합 6=노음(동효), 7=소양, 8=소음, 9=노양(동효)
 * 재현성 원칙: 원시 동전 결과(앞/뒤)를 그대로 기록한다.
 */
(function (root) {
  'use strict';
  var HEX = (typeof require !== 'undefined') ? require('../data/hexagrams.js') : root.FL.hexagrams;

  // 한 효: 동전 3개 → {sum, raw:[H/T...], line:1|0, moving:bool}
  function castLine(rng) {
    var raw = [], sum = 0;
    for (var i = 0; i < 3; i++) {
      var head = rng() < 0.5;          // 앞면(3) / 뒷면(2)
      raw.push(head ? '앞' : '뒤');
      sum += head ? 3 : 2;
    }
    // 6 노음(음,동), 7 소양(양), 8 소음(음), 9 노양(양,동)
    var line = (sum === 7 || sum === 9) ? 1 : 0;
    var moving = (sum === 6 || sum === 9);
    return { sum: sum, raw: raw, line: line, moving: moving };
  }

  function cast(opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var lines = [], movingIdx = [];
    for (var i = 0; i < 6; i++) {               // i=0 맨 아래 1효
      var c = castLine(rng);
      lines.push(c);
      if (c.moving) movingIdx.push(i);
    }
    var primaryBits = lines.map(function (l) { return l.line; });
    var primary = HEX.lookupByLines(primaryBits);

    // 변괘: 동효의 음양을 뒤집음
    var changedBits = primaryBits.slice();
    movingIdx.forEach(function (i) { changedBits[i] = changedBits[i] ? 0 : 1; });
    var changed = movingIdx.length ? HEX.lookupByLines(changedBits) : null;

    // 호괘: 2·3·4효(하) + 3·4·5효(상)  (인덱스 1,2,3 / 2,3,4)
    var nuclearBits = [primaryBits[1], primaryBits[2], primaryBits[3], primaryBits[2], primaryBits[3], primaryBits[4]];
    var nuclear = HEX.lookupByLines(nuclearBits);

    return {
      lines: lines, primaryBits: primaryBits, primary: primary,
      movingIdx: movingIdx, changed: changed, nuclear: nuclear
    };
  }

  // 효 위치 의미(교육용 좌표) — 원전 제1권
  var POS = ['시작·현장', '내부 중심', '전환의 문턱', '외부 진입', '결정권', '극점·이탈'];

  var api = { cast: cast, POS: POS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.iching = api;
})(typeof window !== 'undefined' ? window : globalThis);

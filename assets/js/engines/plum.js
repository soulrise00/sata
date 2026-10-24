/*
 * plum.js — 매화역수(梅花易數) 수·시간 기괘
 * 원전 제1권 제5장. 先天八卦 수: 1乾2兌3離4震5巽6坎7艮8坤
 *   상괘 = 수1 mod 8, 하괘 = 수2 mod 8, 동효 = (수1+수2) mod 6
 *   체용(體用): 동효가 든 괘 = 用, 나머지 = 體. 체용 생극으로 길흉 경향을 본다.
 */
(function (root) {
  'use strict';
  var HEX = (typeof require !== 'undefined') ? require('../data/hexagrams.js') : root.FL.hexagrams;

  // 선천수 → 팔괘 이름 (1..8)
  var NUM2TRI = { 1: '乾', 2: '兌', 3: '離', 4: '震', 5: '巽', 6: '坎', 7: '艮', 8: '坤' };
  // 팔괘 오행 (0목1화2토3금4수)
  var TRI_ELEM = { '乾': 3, '兌': 3, '離': 1, '震': 0, '巽': 0, '坎': 4, '艮': 2, '坤': 2 };
  var ELEM = ['목', '화', '토', '금', '수'];

  function mod(n, m) { return ((n % m) + m) % m; }
  function pick(n) { var r = mod(n, 8); return r === 0 ? 8 : r; }
  function pickLine(n) { var r = mod(n, 6); return r === 0 ? 6 : r; }

  function castByNumbers(upperNum, lowerNum) {
    var up = NUM2TRI[pick(upperNum)];
    var lo = NUM2TRI[pick(lowerNum)];
    var moving = pickLine(upperNum + lowerNum); // 1..6 (아래부터)
    var ut = HEX.TRI[up].bits, lt = HEX.TRI[lo].bits;
    var lines = [lt[0], lt[1], lt[2], ut[0], ut[1], ut[2]];
    var primary = HEX.lookupByLines(lines);

    var changed = lines.slice();
    changed[moving - 1] = changed[moving - 1] ? 0 : 1;
    var changedHex = HEX.lookupByLines(changed);

    // 호괘
    var nuclear = HEX.lookupByLines([lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]]);

    // 체용: 동효(1..6) 위치. 1~3 → 하괘 동(用=하괘), 4~6 → 상괘 동(用=상괘)
    var useTri = (moving <= 3) ? lo : up;
    var bodyTri = (moving <= 3) ? up : lo;
    var rel = relation(TRI_ELEM[bodyTri], TRI_ELEM[useTri]);

    return {
      upper: up, lower: lo, moving: moving, primary: primary,
      changed: changedHex, nuclear: nuclear,
      body: bodyTri, use: useTri, bodyElem: ELEM[TRI_ELEM[bodyTri]], useElem: ELEM[TRI_ELEM[useTri]],
      relation: rel
    };
  }

  // 오늘 날짜+시간 기반(간단 변형): 연지+월+일 / +시
  function castByTime(date) {
    date = date || new Date();
    var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), h = date.getHours();
    var yearBranch = mod(y - 4, 12) + 1; // 子=1
    var hourBranch = mod(Math.floor((h + 1) / 2), 12) + 1;
    var upperNum = yearBranch + m + d;
    var lowerNum = yearBranch + m + d + hourBranch;
    return castByNumbers(upperNum, lowerNum);
  }

  function relation(bodyE, useE) {
    // 체 기준: 용이 체를 생=기쁨, 체가 용을 생=설기(소모), 체극용=제어(힘듦이나 통제), 용극체=부담(불리), 비화=순조
    if (bodyE === useE) return { key: '비화(比和)', tone: 'good', desc: '체와 용의 기운이 같아 순조롭고 협력적입니다. 큰 저항 없이 흐릅니다.' };
    if ((useE + 1) % 5 === bodyE) return { key: '용생체(用生體)', tone: 'good', desc: '환경·상대가 나(체)를 북돋웁니다. 외부 지원을 받기 좋은 국면입니다.' };
    if ((bodyE + 1) % 5 === useE) return { key: '체생용(體生用)', tone: 'warn', desc: '내가 에너지를 밖으로 내보냅니다. 베풀고 소모하는 국면 — 회수 계획이 필요합니다.' };
    if ((bodyE + 2) % 5 === useE) return { key: '체극용(體剋用)', tone: 'neutral', desc: '내가 대상을 제어합니다. 주도권은 있으나 힘을 쓰는 대가를 봅니다.' };
    return { key: '용극체(用剋體)', tone: 'warn', desc: '환경·상대의 압력이 나를 누릅니다. 무리한 돌파보다 방어·보류가 안전합니다.' };
  }

  var api = { castByNumbers: castByNumbers, castByTime: castByTime };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.plum = api;
})(typeof window !== 'undefined' ? window : globalThis);

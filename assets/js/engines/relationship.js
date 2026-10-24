/*
 * relationship.js — 궁합(宮合) 엔진
 * method: zodiac(띠) / western(별자리) / saju(일간·일지) / numerology(생명경로)
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;
  var saju = (typeof require !== 'undefined') ? require('./saju.js') : root.FL.saju;
  var western = (typeof require !== 'undefined') ? require('./western.js') : root.FL.western;
  var numerology = (typeof require !== 'undefined') ? require('./numerology.js') : root.FL.numerology;

  var ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  var SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
  var YUKHAP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
  var CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3, 4: 10, 10: 4, 5: 11, 11: 5 };

  function yb(d) { var jd = astro.julianDayUT(d.year, d.month, d.day, 12, 0, 9); var lon = astro.sunLongitude(jd); var sy = d.year; if (d.month === 1) sy = d.year - 1; if (d.month === 2 && lon >= 285 && lon < 315) sy = d.year - 1; return ((sy - 4) % 12 + 12) % 12; }

  function zodiac(a, b) {
    var ba = yb(a), bb = yb(b);
    var score = 55, notes = [];
    var sameGroup = SAMHAP.some(function (g) { return g.indexOf(ba) >= 0 && g.indexOf(bb) >= 0; });
    if (ba === bb) { score = 68; notes.push('같은 띠 — 서로를 잘 이해하지만 비슷한 약점도 공유합니다.'); }
    else if (sameGroup) { score = 90; notes.push('삼합(三合) — 뜻과 방향이 크게 통하는 최상의 조합입니다.'); }
    else if (YUKHAP[ba] === bb) { score = 85; notes.push('육합(六合) — 가깝게 끌리고 결속이 좋습니다.'); }
    else if (CHUNG[ba] === bb) { score = 45; notes.push('충(沖) — 자극과 변화가 큽니다. 다름을 에너지로 쓰면 성장, 방치하면 마찰.'); }
    else { score = 62; notes.push('무난한 조합 — 서로의 리듬을 배우며 맞춰가는 관계입니다.'); }
    return { score: score, a: ANIMALS[ba], b: ANIMALS[bb], notes: notes };
  }

  function westernPair(a, b) {
    var sa = western.compute({ year: a.year, month: a.month, day: a.day, hour: 12, tz: 9 }).sign;
    var sb = western.compute({ year: b.year, month: b.month, day: b.day, hour: 12, tz: 9 }).sign;
    var comp = { '불불': 85, '흙흙': 80, '공기공기': 82, '물물': 80, '불공기': 88, '공기불': 88, '흙물': 86, '물흙': 86, '불흙': 55, '흙불': 55, '불물': 50, '물불': 50, '흙공기': 52, '공기흙': 52, '공기물': 54, '물공기': 54 };
    var key = sa.elem + sb.elem;
    var score = comp[key] || 60;
    var note = (score >= 82) ? '원소가 서로를 북돋우는 조화로운 조합입니다.' : (score >= 60 ? '서로 다른 리듬을 조율하면 보완이 되는 조합입니다.' : '원소의 결이 달라 의식적 이해와 소통이 필요한 조합입니다.');
    return { score: score, a: sa.ko + '(' + sa.elem + ')', b: sb.ko + '(' + sb.elem + ')', notes: [note] };
  }

  function sajuPair(a, b) {
    var ra = saju.compute({ year: a.year, month: a.month, day: a.day, hour: 12, noHour: true, tz: 9 });
    var rb = saju.compute({ year: b.year, month: b.month, day: b.day, hour: 12, noHour: true, tz: 9 });
    var ea = ra.dayMaster.elemIdx, eb = rb.dayMaster.elemIdx;
    var gen = (ea + 1) % 5 === eb || (eb + 1) % 5 === ea;
    var ctrl = (ea + 2) % 5 === eb || (eb + 2) % 5 === ea;
    var score = ea === eb ? 70 : (gen ? 85 : (ctrl ? 55 : 65));
    var note = ea === eb ? '두 일간의 오행이 같아 닮은 가치를 공유합니다.' : (gen ? '한쪽이 다른 쪽을 생(生)하는 상생 관계 — 서로를 키웁니다.' : (ctrl ? '상극(相剋) 관계 — 긴장이 있으나 역할을 나누면 균형이 됩니다.' : '무난한 오행 관계로 서로 배워가는 조합입니다.'));
    // 일지(배우자궁) 관계
    var ba = ra.pillars.day.branch, bb = rb.pillars.day.branch;
    var branchNote = YUKHAP[ba] === bb ? ' 일지가 육합 — 정서적 결속이 좋습니다.' : (CHUNG[ba] === bb ? ' 일지가 충 — 생활 리듬 조율이 필요합니다.' : '');
    return { score: score, a: ra.dayMaster.han + '(' + ra.dayMaster.elem + ')', b: rb.dayMaster.han + '(' + rb.dayMaster.elem + ')', notes: [note + branchNote] };
  }

  function numPair(a, b) {
    var na = numerology.compute({ year: a.year, month: a.month, day: a.day }).lifePath;
    var nb = numerology.compute({ year: b.year, month: b.month, day: b.day }).lifePath;
    var diff = Math.abs(na - nb);
    var score = na === nb ? 72 : (diff <= 2 ? 80 : (diff >= 6 ? 58 : 68));
    var note = na === nb ? '같은 생명경로 — 삶의 리듬이 비슷해 편안합니다.' : (diff <= 2 ? '가까운 생명경로 — 비슷한 속도로 걷는 조합입니다.' : '다른 생명경로 — 보완은 크지만 이해의 노력이 필요합니다.');
    return { score: score, a: '생명경로 ' + na, b: '생명경로 ' + nb, notes: [note] };
  }

  function compute(method, a, b) {
    var r = method === 'western' ? westernPair(a, b) : method === 'saju' ? sajuPair(a, b) : method === 'numerology' ? numPair(a, b) : zodiac(a, b);
    r.method = method;
    return r;
  }
  var api = { compute: compute };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.relationship = api;
})(typeof window !== 'undefined' ? window : globalThis);

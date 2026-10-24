/*
 * biorhythm.js — 생체리듬 (신체23·감성28·지성33일 주기)
 * 20세기 초 제안된 모델. 주기 자체는 정확히 '재현(R)' 가능하나,
 * 외부 성과 예측력(P)은 대조연구에서 지지되지 않음 → UI에서 명시.
 */
(function (root) {
  'use strict';
  var CYCLES = [
    { key: 'physical', ko: '신체(Physical)', days: 23, color: '#e0564b', hi: '체력·활력·지구력이 올라, 운동·실행·육체적 과제에 유리', lo: '피로가 쌓이기 쉬움 — 무리한 일정·수면부족을 피하고 회복에 투자' },
    { key: 'emotional', ko: '감성(Emotional)', days: 28, color: '#caa23b', hi: '기분·공감·창의가 안정적 — 관계·표현·협업에 유리', lo: '예민해지기 쉬움 — 중요한 감정적 대화는 날을 고르는 편이 좋음' },
    { key: 'intellectual', ko: '지성(Intellectual)', days: 33, color: '#3a7bd5', hi: '집중·분석·판단이 또렷 — 학습·의사결정·기획에 유리', lo: '판단이 흐려질 수 있음 — 중대한 결정은 재확인 절차를 두기' }
  ];

  function daysBetween(y1, m1, d1, y2, m2, d2) {
    var a = Date.UTC(y1, m1 - 1, d1), b = Date.UTC(y2, m2 - 1, d2);
    return Math.round((b - a) / 86400000);
  }

  function compute(input) {
    var t = input.target || {};
    var now = new Date();
    var ty = t.year || now.getFullYear(), tm = t.month || (now.getMonth() + 1), td = t.day || now.getDate();
    var n = daysBetween(input.year, input.month, input.day, ty, tm, td);
    var results = CYCLES.map(function (c) {
      var v = Math.sin(2 * Math.PI * n / c.days);
      var pct = Math.round(v * 100);
      // 전날 대비 상승/하강
      var vPrev = Math.sin(2 * Math.PI * (n - 1) / c.days);
      var rising = v >= vPrev;
      var phase = Math.abs(pct) < 15 ? 'critical' : (pct >= 0 ? 'high' : 'low');
      return { key: c.key, ko: c.ko, color: c.color, value: v, pct: pct, rising: rising, phase: phase,
        note: phase === 'critical' ? '전환점(0선 근처) — 기복이 큰 날, 중요한 시도는 신중히' : (pct >= 0 ? c.hi : c.lo) };
    });
    return { daysSinceBirth: n, target: { year: ty, month: tm, day: td }, cycles: results };
  }

  var api = { compute: compute, CYCLES: CYCLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.biorhythm = api;
})(typeof window !== 'undefined' ? window : globalThis);

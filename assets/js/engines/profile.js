/*
 * profile.js — 생년/입력 기반 프로필 산출 엔진
 * 당사주·구성기학 본명성·네이티브 토템·요일점·삼재·혈액형
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;
  var P = (typeof require !== 'undefined') ? require('../data/profiles-data.js') : root.FL.profilesData;
  var BR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

  function yearBranch(y, mo, d) {
    var jd = astro.julianDayUT(y, mo, d, 12, 0, 9);
    var lon = astro.sunLongitude(jd);
    var sy = y;
    if (mo === 1) sy = y - 1;
    if (mo === 2 && lon >= 285 && lon < 315) sy = y - 1;
    return { branch: ((sy - 4) % 12 + 12) % 12, solarYear: sy };
  }

  function dangsaju(input) {
    var yb = yearBranch(input.year, input.month, input.day);
    var han = BR[yb.branch];
    var info = P.DANGSA[han];
    return { branch: yb.branch, han: han, star: info[0], meaning: info[1], desc: info[2], animal: ANIMALS[yb.branch] };
  }

  function gusung(input) {
    var yb = yearBranch(input.year, input.month, input.day);
    var Y = yb.solarYear;
    var s = String(Y).split('').reduce(function (a, b) { return a + +b; }, 0);
    while (s > 9) s = String(s).split('').reduce(function (a, b) { return a + +b; }, 0);
    var star = 11 - s; if (star > 9) star -= 9; if (star <= 0) star += 9;
    var info = P.GUSUNG[star];
    return { star: star, name: info[0], elem: info[1], kw: info[2], desc: info[3], solarYear: Y };
  }

  function native(input) {
    var m = input.month, d = input.day, found = P.NATIVE[0];
    for (var i = 0; i < P.NATIVE.length; i++) {
      var t = P.NATIVE[i], s = t[0], e = t[1], ok;
      if (s[0] <= e[0]) ok = (m > s[0] || (m === s[0] && d >= s[1])) && (m < e[0] || (m === e[0] && d <= e[1]));
      else ok = (m > s[0] || (m === s[0] && d >= s[1])) || (m < e[0] || (m === e[0] && d <= e[1]));
      if (ok) { found = t; break; }
    }
    return { animal: found[2], kw: found[3], desc: found[4], range: found[0].join('/') + '–' + found[1].join('/') };
  }

  function thaiday(input) {
    var dow = new Date(input.year, input.month - 1, input.day).getDay();
    var w = P.WEEKDAY[dow];
    return { dow: dow, day: w[0], color: w[1], desc: w[2] };
  }

  function bloodtype(input) {
    var b = (input.blood || 'A').toUpperCase();
    var info = P.BLOOD[b] || P.BLOOD.A;
    return { type: info[0], kw: info[1], desc: info[2] };
  }

  // 삼재 — 띠별 3년 + 현재 해당 여부
  var SAMJAE = { // 삼합그룹 → 삼재 지지(3년: 들·눌·날)
    '巳酉丑': [11, 0, 1], '申子辰': [2, 3, 4], '亥卯未': [5, 6, 7], '寅午戌': [8, 9, 10]
  };
  function samjae(input) {
    var yb = yearBranch(input.year, input.month, input.day);
    var b = yb.branch;
    var groupKey = Object.keys(SAMJAE).filter(function (g) { return [g[0], g[1], g[2]].map(function (c) { return BR.indexOf(c); }).indexOf(b) >= 0; })[0];
    var years = SAMJAE[groupKey];
    var curY = new Date().getFullYear();
    var curYB = ((curY - 4) % 12 + 12) % 12;
    var pos = years.indexOf(curYB);
    var inSamjae = pos >= 0;
    return {
      animal: ANIMALS[b], samjaeAnimals: years.map(function (x) { return ANIMALS[x]; }),
      inSamjae: inSamjae, phase: pos === 0 ? '들삼재(시작)' : (pos === 1 ? '눌삼재(중간)' : (pos === 2 ? '날삼재(마무리)' : null)),
      currentYear: curY, currentAnimal: ANIMALS[curYB]
    };
  }

  var api = { dangsaju: dangsaju, gusung: gusung, native: native, thaiday: thaiday, bloodtype: bloodtype, samjae: samjae };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.profile = api;
})(typeof window !== 'undefined' ? window : globalThis);

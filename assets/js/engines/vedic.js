/*
 * vedic.js — 인도 조티샤(Jyotiṣa) 계산
 * 달의 항성황도 위치 → 나크샤트라 → 비므쇼타리 다샤 잔량·타임라인.
 * 태양·달의 라시(항성 별자리)도 산출. 원전 제3권 제1~2장.
 * 재현성(R): 달 황경 ~0.3° 근사이므로 나크샤트라 경계에서는 민감.
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;

  var NAK = ['아슈위니', '바라니', '크리티카', '로히니', '므리가시라', '아르드라', '푸나르바수', '푸샤', '아슐레샤',
    '마가', '푸르바팔구니', '우타라팔구니', '하스타', '치트라', '스바티', '비샤카', '아누라다', '제슈타',
    '물라', '푸르바아샤다', '우타라아샤다', '슈라바나', '다니슈타', '샤타비샤', '푸르바바드라', '우타라바드라', '레바티'];
  var LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  var LORD_KO = { Ketu: '케투', Venus: '금성', Sun: '태양', Moon: '달', Mars: '화성', Rahu: '라후', Jupiter: '목성', Saturn: '토성', Mercury: '수성' };
  var DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  var RASHI = ['메샤(양)', '브리샤바(황소)', '미투나(쌍둥이)', '카르카(게)', '심하(사자)', '칸야(처녀)',
    '툴라(천칭)', '브리슈치카(전갈)', '다누(사수)', '마카라(염소)', '쿰바(물병)', '미나(물고기)'];

  function compute(input) {
    var tz = (input.tz == null) ? 9 : input.tz;
    var jd = astro.julianDayUT(input.year, input.month, input.day, input.hour == null ? 12 : input.hour, input.minute || 0, tz);
    var moonTrop = astro.moonLongitude(jd);
    var sunTrop = astro.sunLongitude(jd);
    var moonSid = astro.toSidereal(moonTrop, jd);
    var sunSid = astro.toSidereal(sunTrop, jd);

    var nakFloat = moonSid / (360 / 27);
    var nakIdx = Math.floor(nakFloat) % 27;
    var nakFrac = nakFloat - Math.floor(nakFloat);      // 나크샤트라 내 진행 비율
    var pada = Math.floor(nakFrac * 4) + 1;

    var lord = LORDS[nakIdx % 9];
    var remain = (1 - nakFrac) * DASHA_YEARS[lord];     // 출생 시 현 다샤 잔량(년)

    // 다샤 타임라인(출생 기준 경과년 → 종료). 현재 나이에 해당하는 마하다샤 찾기
    var now = new Date();
    var ageYears = (now - new Date(input.year, input.month - 1, input.day)) / (365.25 * 86400000);
    var timeline = [];
    var startIdx = LORDS.indexOf(lord);
    var acc = 0;
    for (var i = 0; i < 9; i++) {
      var L = LORDS[(startIdx + i) % 9];
      var dur = (i === 0) ? remain : DASHA_YEARS[L];
      var start = acc;
      var endAge = acc + dur;
      timeline.push({ lord: L, ko: LORD_KO[L], years: Math.round(dur * 10) / 10, startAge: Math.round(start * 10) / 10, endAge: Math.round(endAge * 10) / 10 });
      acc = endAge;
    }
    var current = timeline.filter(function (t) { return ageYears >= t.startAge && ageYears < t.endAge; })[0] || timeline[0];

    return {
      jd: jd, moonSid: moonSid, sunSid: sunSid,
      nakIdx: nakIdx, nak: NAK[nakIdx], pada: pada, nakLord: lord, nakLordKo: LORD_KO[lord],
      moonRashiIdx: Math.floor(moonSid / 30), moonRashi: RASHI[Math.floor(moonSid / 30)],
      sunRashiIdx: Math.floor(sunSid / 30), sunRashi: RASHI[Math.floor(sunSid / 30)],
      birthBalance: Math.round(remain * 10) / 10,
      ageYears: Math.round(ageYears * 10) / 10,
      timeline: timeline, current: current, hasTime: input.hour != null,
      ayanamsa: astro.ayanamsaLahiri(jd)
    };
  }

  var api = { compute: compute, NAK: NAK, RASHI: RASHI, LORD_KO: LORD_KO, DASHA_YEARS: DASHA_YEARS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.vedic = api;
})(typeof window !== 'undefined' ? window : globalThis);

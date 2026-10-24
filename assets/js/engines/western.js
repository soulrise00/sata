/*
 * western.js — 서양 점성술(열대황도 기준) 태양별자리·원소·양식
 * 원전 제3권 제5장. 출생시각 미상이면 하우스·상승은 읽지 않는다(원칙).
 * 태양 황경은 astro.sunLongitude()로 실제 계산 → 별자리는 재현 가능(R).
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;

  var SIGNS = [
    { ko: '양자리', en: 'Aries', sym: '♈', elem: '불', mode: '활동', ruler: '화성', dates: '3/21–4/19', q: '무엇을 먼저 시작하고 충돌비용을 어떻게 제한할까?' },
    { ko: '황소자리', en: 'Taurus', sym: '♉', elem: '흙', mode: '고정', ruler: '금성', dates: '4/20–5/20', q: '무엇을 유지하고 변화에 필요한 안전을 어떻게 만들까?' },
    { ko: '쌍둥이자리', en: 'Gemini', sym: '♊', elem: '공기', mode: '변통', ruler: '수성', dates: '5/21–6/21', q: '어떤 정보를 비교하고 연결할까?' },
    { ko: '게자리', en: 'Cancer', sym: '♋', elem: '물', mode: '활동', ruler: '달', dates: '6/22–7/22', q: '누구를 보호하고 어떤 경계를 세울까?' },
    { ko: '사자자리', en: 'Leo', sym: '♌', elem: '불', mode: '고정', ruler: '태양', dates: '7/23–8/22', q: '무엇을 창조하고 인정욕구를 어떻게 책임으로 바꿀까?' },
    { ko: '처녀자리', en: 'Virgo', sym: '♍', elem: '흙', mode: '변통', ruler: '수성', dates: '8/23–9/22', q: '무엇을 분해·수정하고 완벽주의를 어떻게 조절할까?' },
    { ko: '천칭자리', en: 'Libra', sym: '♎', elem: '공기', mode: '활동', ruler: '금성', dates: '9/23–10/22', q: '어떤 기준으로 협상하고 불균형을 조정할까?' },
    { ko: '전갈자리', en: 'Scorpio', sym: '♏', elem: '물', mode: '고정', ruler: '화성·명왕성', dates: '10/23–11/22', q: '어떤 깊은 자원과 통제문제를 다룰까?' },
    { ko: '사수자리', en: 'Sagittarius', sym: '♐', elem: '불', mode: '변통', ruler: '목성', dates: '11/23–12/21', q: '무엇을 탐색하고 믿음의 과장을 어떻게 점검할까?' },
    { ko: '염소자리', en: 'Capricorn', sym: '♑', elem: '흙', mode: '활동', ruler: '토성', dates: '12/22–1/19', q: '어떤 목표를 단계와 책임으로 구조화할까?' },
    { ko: '물병자리', en: 'Aquarius', sym: '♒', elem: '공기', mode: '고정', ruler: '토성·천왕성', dates: '1/20–2/18', q: '어떤 시스템을 바꾸고 집단과 거리를 조절할까?' },
    { ko: '물고기자리', en: 'Pisces', sym: '♓', elem: '물', mode: '변통', ruler: '목성·해왕성', dates: '2/19–3/20', q: '어디에서 공감하고 경계를 회복할까?' }
  ];

  var ELEM_DESC = {
    '불': '추진·표현·의지의 에너지. 시작은 빠르지만 지속과 완급 조절이 과제.',
    '흙': '안정·실용·축적의 에너지. 든든하지만 변화 수용과 유연성이 과제.',
    '공기': '관계·언어·사고의 에너지. 연결에 능하지만 결정·깊이가 과제.',
    '물': '감정·직관·공감의 에너지. 깊이 있지만 경계 설정과 객관화가 과제.'
  };
  var MODE_DESC = {
    '활동': '국면을 여는 개시형. 먼저 움직이되 마무리 담당을 정해 두는 편이 좋습니다.',
    '고정': '유지·집중형. 끈기가 강점이나 전환 시점을 놓치지 않도록 점검이 필요합니다.',
    '변통': '적응·조율형. 상황에 잘 맞추지만 핵심 기준을 먼저 고정해 두면 흔들림이 줄어듭니다.'
  };

  function compute(input) {
    var tz = (input.tz == null) ? 9 : input.tz;
    var jd = astro.julianDayUT(input.year, input.month, input.day, input.hour || 12, input.minute || 0, tz);
    var lon = astro.sunLongitude(jd);
    var idx = Math.floor(lon / 30) % 12;
    var deg = lon - idx * 30;
    var sign = SIGNS[idx];
    // 경계(±1°)면 민감도 안내
    var boundary = (deg < 1 || deg > 29);
    return {
      sunLon: lon, signIndex: idx, degInSign: deg, sign: sign,
      elemDesc: ELEM_DESC[sign.elem], modeDesc: MODE_DESC[sign.mode],
      boundary: boundary, hasTime: !!input.hour
    };
  }

  var api = { compute: compute, SIGNS: SIGNS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.western = api;
})(typeof window !== 'undefined' ? window : globalThis);

/*
 * chrono.js — 때(時) 기반 체계: 일진·택일, 행성시, 24절기
 * 날짜 입력으로 오늘/특정일의 간지·길흉 경향, 행성시, 절기를 산출.
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;
  var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var SK = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  var BR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var BK = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  var ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  var STEM_ELEM = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; var ELEM = ['목', '화', '토', '금', '수'];
  var WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

  function dayGanzhi(y, m, d) {
    var jdn = astro.julianDayNumber(y, m, d);
    var idx = ((jdn - 11) % 60 + 60) % 60;
    return { idx: idx, stem: idx % 10, branch: idx % 12 };
  }

  // 일진/택일
  function iljin(input) {
    var now = new Date();
    var y = input.year || now.getFullYear(), m = input.month || (now.getMonth() + 1), d = input.day || now.getDate();
    var gz = dayGanzhi(y, m, d);
    var elem = ELEM[STEM_ELEM[gz.stem]];
    var jd = astro.julianDayUT(y, m, d, 12, 0, 9);
    var lon = astro.sunLongitude(jd);
    var termIdx = Math.floor(((lon - 315 + 360) % 360) / 15); // 0~23 절기
    var dow = new Date(y, m - 1, d).getDay();
    // 간단 길흉 경향: 일간 오행별 활동 권장
    var ADVICE = {
      '목': '시작·기획·계약에 좋은 결. 새 일을 벌이고 사람을 연결하기 좋다. 조급한 확장만 경계.',
      '화': '발표·홍보·만남에 좋은 결. 드러내고 속도를 내기 좋되, 과열·소모를 식힐 것.',
      '토': '정리·중재·마무리에 좋은 결. 쌓고 안정시키기 좋다. 결정을 미루지는 말 것.',
      '금': '결단·정리·수확에 좋은 결. 끊고 매듭짓기 좋다. 지나친 비판은 자제.',
      '수': '학습·협상·이동에 좋은 결. 정보를 다루고 흐르기 좋다. 비밀·오해를 점검.'
    };
    return {
      date: y + '.' + m + '.' + d, weekday: WEEKDAY[dow],
      ganzhi: STEMS[gz.stem] + BR[gz.branch], ganzhiKo: SK[gz.stem] + BK[gz.branch],
      animal: ANIMALS[gz.branch], elem: elem, advice: ADVICE[elem],
      term: astro.SOLAR_TERMS[termIdx] || '', sunLon: lon
    };
  }

  // 행성시(Planetary Hours) — 칼데안 순서
  function planetaryHours(input) {
    var now = new Date();
    var y = input.year || now.getFullYear(), m = input.month || (now.getMonth() + 1), d = input.day || now.getDate();
    var dow = new Date(y, m - 1, d).getDay();
    var dayRuler = astro.DAY_RULERS[dow];
    // 칼데안 순서에서 요일 지배행성부터 24시간 순환
    var order = astro.CHALDEAN; // 느린→빠른: 토 목 화 태양 금 수 달
    var startIdx = order.indexOf(dayRuler);
    var hours = [];
    for (var i = 0; i < 24; i++) hours.push(order[(startIdx + i) % 7]);
    // 현재 시간(낮/밤 균등 12분할 근사: 06시 일출, 18시 일몰 가정)
    var h = now.getHours() + now.getMinutes() / 60;
    var hourIndex;
    if (h >= 6 && h < 18) hourIndex = Math.floor((h - 6) / (12 / 12)); // 낮 12시간
    else hourIndex = 12 + Math.floor(((h < 6 ? h + 24 : h) - 18) / (12 / 12));
    hourIndex = Math.max(0, Math.min(23, hourIndex));
    var MEAN = { '태양': '활력·성공·인정', '달': '감정·가정·대중', '화성': '추진·경쟁·수술', '수성': '소통·거래·학습', '목성': '확장·행운·법·교육', '금성': '사랑·예술·금전', '토성': '인내·부동산·마무리' };
    return {
      date: y + '.' + m + '.' + d, weekday: WEEKDAY[dow], dayRuler: dayRuler,
      dayRulerMeaning: MEAN[dayRuler], hours: hours, currentHour: hours[hourIndex],
      currentMeaning: MEAN[hours[hourIndex]], hourIndex: hourIndex, isToday: (!input.year)
    };
  }

  // 24절기
  function solarTerms(input) {
    var now = new Date();
    var y = input.year || now.getFullYear(), m = input.month || (now.getMonth() + 1), d = input.day || now.getDate();
    var jd = astro.julianDayUT(y, m, d, 12, 0, 9);
    var lon = astro.sunLongitude(jd);
    var idx = Math.floor(((lon - 315 + 360) % 360) / 15);
    var cur = astro.SOLAR_TERMS[idx];
    var nextIdx = (idx + 1) % 24;
    var nextLonAbs = (315 + (idx + 1) * 15) % 360;
    var jdNext = astro.jdAtSunLongitude(nextLonAbs, jd + 10);
    var daysTo = jdNext ? Math.round(jdNext - jd) : null;
    return { date: y + '.' + m + '.' + d, current: cur, next: astro.SOLAR_TERMS[nextIdx], daysToNext: daysTo, sunLon: lon };
  }

  // 지금 이 시각의 십이시
  var HOUR_ADVICE = { '子': '고요히 쉬고 다음을 준비할 때. 중요한 일은 미루세요.', '丑': '깊은 휴식과 회복의 시간.', '寅': '하루를 여는 기운이 싹트는 때. 계획을 세우기 좋습니다.', '卯': '해가 떠오르듯 시작·출발에 좋은 시간.', '辰': '활력이 오르는 때. 실행과 추진에 좋습니다.', '巳': '집중력이 좋은 때. 핵심 업무를 처리하세요.', '午': '기운이 정점. 중요한 결정·발표에 좋되 과열 주의.', '未': '여유롭게 정리·소통하기 좋은 때.', '申': '거래·협상·이동에 좋은 활동의 시간.', '酉': '마무리와 결실을 거두기 좋은 때.', '戌': '하루를 돌아보고 관계를 다지기 좋은 때.', '亥': '마음을 가라앉히고 내면으로 돌아갈 때.' };
  var HOUR_RANGE = { '子': '23:00~01:00', '丑': '01:00~03:00', '寅': '03:00~05:00', '卯': '05:00~07:00', '辰': '07:00~09:00', '巳': '09:00~11:00', '午': '11:00~13:00', '未': '13:00~15:00', '申': '15:00~17:00', '酉': '17:00~19:00', '戌': '19:00~21:00', '亥': '21:00~23:00' };
  function sijin() {
    var now = new Date();
    var h = now.getHours();
    var branch = Math.floor(((h % 24) + 1) / 2) % 12;
    var gz = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
    // 시간(時干) 오서둔
    var hourStem = ((gz.stem % 5) * 2 + branch) % 10;
    return {
      date: now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate(),
      time: (h < 10 ? '0' + h : h) + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes(),
      branch: branch, branchKo: BK[branch], animal: ANIMALS[branch], ganzhi: STEMS[hourStem] + BR[branch],
      hourRange: HOUR_RANGE[BR[branch]], advice: HOUR_ADVICE[BR[branch]]
    };
  }

  var api = { iljin: iljin, planetaryHours: planetaryHours, solarTerms: solarTerms, dayGanzhi: dayGanzhi, sijin: sijin };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.chrono = api;
})(typeof window !== 'undefined' ? window : globalThis);

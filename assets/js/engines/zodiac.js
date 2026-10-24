/*
 * zodiac.js — 띠·십이지(十二支) 동물과 관계(삼합·육합·충)
 * 연지(年支)는 입춘 경계로 계산(사주 엔진과 동일 논리). 민속·문화 상징 체계.
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;

  var BR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  var ELEM = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];

  var TRAIT = [
    { k: '기민·수완', s: '관찰력이 빠르고 자원을 모으는 데 능합니다.', c: '지나친 계산과 불안으로 작은 일에 매이지 않도록.' },
    { k: '성실·인내', s: '묵묵히 쌓아 신뢰를 얻는 지구력이 강점입니다.', c: '고집과 변화 거부가 기회를 늦출 수 있습니다.' },
    { k: '용기·추진', s: '앞장서 국면을 여는 결단력이 있습니다.', c: '속도와 충돌비용을 관리하는 장치가 필요합니다.' },
    { k: '온화·외교', s: '관계를 부드럽게 조율하는 감각이 있습니다.', c: '우유부단과 회피로 결정을 미루지 않도록.' },
    { k: '비전·카리스마', s: '큰 그림과 자신감으로 사람을 끌어당깁니다.', c: '과장과 현실감각 저하를 점검하세요.' },
    { k: '통찰·집중', s: '깊이 파고들어 본질을 꿰뚫습니다.', c: '의심과 비밀주의가 관계를 좁힐 수 있습니다.' },
    { k: '열정·자유', s: '활력과 추진력으로 멀리 나아갑니다.', c: '산만함과 번아웃을 조절할 리듬이 필요합니다.' },
    { k: '공감·예술성', s: '섬세하고 배려 깊어 분위기를 살립니다.', c: '불안과 의존을 경계하고 경계를 세우세요.' },
    { k: '재치·융통', s: '영리하고 적응이 빨라 문제를 잘 풉니다.', c: '얕은 꾀와 변덕이 신뢰를 흔들 수 있습니다.' },
    { k: '정밀·책임', s: '꼼꼼하고 성실해 완성도를 높입니다.', c: '완벽주의와 비판이 과하지 않도록.' },
    { k: '충직·정의', s: '신의가 두텁고 공정을 중시합니다.', c: '과도한 걱정과 냉소를 다스리세요.' },
    { k: '관대·낙천', s: '너그럽고 풍요를 나누는 여유가 있습니다.', c: '안이함과 경계 부족을 점검하세요.' }
  ];

  // 삼합 그룹(인덱스)
  var SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
  var YUKHAP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
  var CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3, 4: 10, 10: 4, 5: 11, 11: 5 };

  function yearBranch(y, mo, d) {
    var jd = astro.julianDayUT(y, mo, d, 12, 0, 9);
    var lon = astro.sunLongitude(jd);
    var sy = y;
    if (mo === 1) sy = y - 1;
    if (mo === 2 && lon >= 285 && lon < 315) sy = y - 1;
    return { branch: ((sy - 4) % 12 + 12) % 12, solarYear: sy };
  }

  function compute(input) {
    var yb = yearBranch(input.year, input.month, input.day);
    var b = yb.branch;
    var sam = SAMHAP.filter(function (g) { return g.indexOf(b) >= 0; })[0] || [];
    var samOthers = sam.filter(function (x) { return x !== b; });
    // 올해 운세(세운): 올해 태세 지지와의 관계
    var curY = new Date().getFullYear();
    var curB = ((curY - 4) % 12 + 12) % 12;
    var yf;
    if (curB === b) yf = { label: '본명년(本命年)', text: '내 띠의 해 — 에너지가 강하지만 태세와 겹쳐 기복도 큽니다. 새로 벌이기보다 건강·안정을 챙기고, 붉은색 소품으로 기운을 북돋우는 전통이 있습니다.' };
    else if (SAMHAP.some(function (g) { return g.indexOf(b) >= 0 && g.indexOf(curB) >= 0; })) yf = { label: '삼합의 해 — 大吉', text: '올해 태세와 삼합을 이뤄 귀인·협력·성취의 기운이 큽니다. 미뤄 둔 도전과 확장을 시도하기 좋은 해입니다.' };
    else if (YUKHAP[b] === curB) yf = { label: '육합의 해 — 吉', text: '올해 태세와 육합 — 인연과 결속, 안정된 성과의 해입니다. 관계·계약에 특히 좋습니다.' };
    else if (CHUNG[b] === curB) yf = { label: '충(沖)의 해 — 변동', text: '올해 태세와 충 — 변화·이동·전환이 큰 해입니다. 큰 계약·투자는 신중히, 다만 변화를 에너지로 쓰면 도약의 계기가 됩니다.' };
    else yf = { label: '평운(平運)', text: '올해는 큰 충돌 없이 무난한 흐름입니다. 기본기를 다지고 꾸준히 쌓으면 좋은 해입니다.' };

    return {
      branch: b, han: BR[b], animal: ANIMALS[b], elem: ELEM[b], trait: TRAIT[b],
      solarYear: yb.solarYear,
      harmony: { samhap: samOthers.map(function (i) { return ANIMALS[i]; }), yukhap: ANIMALS[YUKHAP[b]] },
      clash: ANIMALS[CHUNG[b]],
      yearFortune: { year: curY, label: yf.label, text: yf.text }
    };
  }

  var api = { compute: compute, ANIMALS: ANIMALS, BR: BR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.zodiac = api;
})(typeof window !== 'undefined' ? window : globalThis);

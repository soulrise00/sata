/*
 * celtic.js — 켈트 나무 점성(Celtic Tree Zodiac)
 * 드루이드 전통에 기반한 현대적 체계. 생일의 나무 상징과 기질.
 */
(function (root) {
  'use strict';
  // [시작(월,일), 끝(월,일), 나무, 영문, 오검자, 키워드, 해설]
  var TREES = [
    [[12, 24], [1, 20], '자작나무', 'Birch', 'ᚁ Beith', '개척·시작', '새 출발을 여는 선구자. 끈기와 비전으로 길을 낸다. 지나친 자기비판을 경계.'],
    [[1, 21], [2, 17], '마가목', 'Rowan', 'ᚂ Luis', '비전·독창', '이상주의적 사상가. 독창적이며 인류애가 깊다. 고립되지 않도록 연결을.'],
    [[2, 18], [3, 17], '물푸레', 'Ash', 'ᚃ Fearn', '예술·직관', '감수성 깊은 예술가. 내면 세계가 풍부하다. 현실의 닻을 함께.'],
    [[3, 18], [4, 14], '오리나무', 'Alder', 'ᚄ Saille', '용기·개척', '길을 트는 선구자. 자신감과 매력으로 사람을 이끈다.'],
    [[4, 15], [5, 12], '버드나무', 'Willow', 'ᚅ Nuin', '직관·공감', '달의 감수성과 통찰. 상상력이 풍부하나 감정 기복을 다스릴 것.'],
    [[5, 13], [6, 9], '산사나무', 'Hawthorn', 'ᚆ Uath', '호기심·균형', '겉과 속이 다른 다면적 존재. 유머와 통찰, 적응력이 강점.'],
    [[6, 10], [7, 7], '참나무', 'Oak', 'ᚇ Duir', '힘·보호', '든든한 보호자이자 낙천가. 정의감이 강하고 역경에 강하다.'],
    [[7, 8], [8, 4], '호랑가시', 'Holly', 'ᚈ Tinne', '고귀·야망', '위엄과 리더십. 관대하나 자존심이 강하다. 겸손을 벗 삼아.'],
    [[8, 5], [9, 1], '개암나무', 'Hazel', 'ᚊ Coll', '지혜·총명', '영리한 학자. 지식과 디테일에 강하다. 완벽주의를 조절.'],
    [[9, 2], [9, 29], '포도덩굴', 'Vine', 'ᚋ Muin', '조화·심미', '우아한 감식가. 균형과 외교에 능하나 우유부단을 경계.'],
    [[9, 30], [10, 27], '담쟁이', 'Ivy', 'ᚍ Gort', '인내·충실', '역경 속에서 자라는 끈기. 충실하고 사려 깊다.'],
    [[10, 28], [11, 24], '갈대', 'Reed', 'ᚎ Ngetal', '통찰·탐구', '숨은 진실을 캐는 탐구자. 비밀을 읽는 힘, 드라마는 절제.'],
    [[11, 25], [12, 23], '딱총나무', 'Elder', 'ᚏ Ruis', '자유·경험', '모험을 사랑하는 자유로운 영혼. 경험으로 지혜를 얻는다.']
  ];

  function compute(input) {
    var m = input.month, d = input.day;
    var found = TREES[0];
    for (var i = 0; i < TREES.length; i++) {
      var t = TREES[i], s = t[0], e = t[1];
      var inRange;
      if (s[0] <= e[0]) inRange = (m > s[0] || (m === s[0] && d >= s[1])) && (m < e[0] || (m === e[0] && d <= e[1]));
      else inRange = (m > s[0] || (m === s[0] && d >= s[1])) || (m < e[0] || (m === e[0] && d <= e[1])); // 연말 걸침
      if (inRange) { found = t; break; }
    }
    return { tree: found[2], en: found[3], ogham: found[4], kw: found[5], desc: found[6], range: found[0].join('/') + '–' + found[1].join('/') };
  }
  var api = { compute: compute, TREES: TREES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.celtic = api;
})(typeof window !== 'undefined' ? window : globalThis);

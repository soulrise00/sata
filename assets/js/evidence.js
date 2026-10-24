/*
 * evidence.js — 다섯 가지 근거 등급(H·R·P·C·X)
 * 원전 제1권: "역사적으로 사용되었다 / 절차를 재현할 수 있다 / 상담에 도움이 된다 /
 *  기준모형보다 잘 맞힌다" 는 서로 다른 사실이다. 플랫폼은 이 넷(+윤리)을 분리 표시한다.
 * 레벨 0=미검증·해당없음, 1=낮음, 2=보통, 3=높음.  X는 '주의도'(높을수록 위험).
 */
(function (root) {
  'use strict';
  var GRADES = {
    H: { key: 'H', ko: '역사적 근거', en: 'Historical', desc: '문헌·유물·전승의 존재와 성립 시기. 오래되었다는 사실이 적중력을 뜻하지 않는다.' },
    R: { key: 'R', ko: '절차 재현성', en: 'Reproducibility', desc: '같은 입력·규칙이면 다른 사람도 같은 도표·중간값을 얻는가.' },
    P: { key: 'P', ko: '외부 예측타당도', en: 'Predictive validity', desc: '결과를 보기 전 고정한 예측이 기준율·단순모형보다 실제 사건을 잘 맞히는가.' },
    C: { key: 'C', ko: '상담 효용', en: 'Counseling utility', desc: '질문을 정리하고 대안을 찾고 행동을 계획하는 데 도움이 되는가.' },
    X: { key: 'X', ko: '위험·윤리 주의도', en: 'Risk & ethics', desc: '숙명론·의존·차별·공포·금전손실을 일으킬 가능성(높을수록 주의).' }
  };
  var LVL = ['미검증', '낮음', '보통', '높음'];

  // 배지 1개 렌더
  function badge(letter, level) {
    var inverted = letter === 'X';
    var on = inverted ? level >= 2 : level >= 2;
    var cls = on ? 'on' : 'off';
    var word = inverted ? (['낮음', '낮음', '보통', '높음'][level] + ' 주의') : LVL[level];
    var g = GRADES[letter];
    return '<span class="ebadge ' + cls + '" title="' + g.ko + ' — ' + g.desc + '"><i class="g-' + letter + '">' + letter + '</i>' +
      g.ko + ' <b style="font-weight:800">' + word + '</b></span>';
  }

  // 등급 묶음 렌더 (grades = {H,R,P,C,X})
  function badges(grades) {
    return '<div class="badges">' + ['H', 'R', 'P', 'C', 'X'].map(function (k) { return badge(k, grades[k] == null ? 0 : grades[k]); }).join('') + '</div>';
  }

  // 미니 배지(카드용) — P·R 중심으로 2개만
  function mini(grades) {
    return '<div class="mini-grades">' + ['R', 'P', 'C'].map(function (k) {
      var lv = grades[k] == null ? 0 : grades[k];
      return '<span class="mini-grade g-' + k + (lv < 2 ? ' dim' : '') + '" title="' + GRADES[k].ko + ': ' + LVL[lv] + '">' + k + '</span>';
    }).join('') + '</div>';
  }

  var api = { GRADES: GRADES, LVL: LVL, badge: badge, badges: badges, mini: mini };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.evidence = api;
})(typeof window !== 'undefined' ? window : globalThis);

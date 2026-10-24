/*
 * numerology.js — 수비학(피타고라스식) 생명경로수·개인해(personal year)
 * 원전 제3권 제36장(수비학·게마트리아). 문화적 상징 체계이며 외부사건 예측력은 미검증.
 */
(function (root) {
  'use strict';

  function reduce(n, keepMaster) {
    while (n > 9) {
      if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
      n = String(n).split('').reduce(function (a, b) { return a + (+b); }, 0);
    }
    return n;
  }

  var LIFE = {
    1: { kw: '개척·독립', desc: '스스로 길을 내는 선도자 성향. 주도성과 추진력이 강점이나, 혼자 떠안아 고립되거나 조급해지는 것을 경계합니다.', do: '작게 시작해 책임 범위를 먼저 정하고, 협력자를 1명 이상 두세요.' },
    2: { kw: '협력·조율', desc: '관계와 균형의 조정자. 공감·중재에 강하나, 결정을 미루거나 남의 기대에 휘둘리기 쉽습니다.', do: '내 기준을 한 문장으로 적어 두고, 거절의 조건을 미리 정하세요.' },
    3: { kw: '표현·창조', desc: '말·글·예술로 드러내는 표현가. 활력과 영감이 강점이나, 에너지가 흩어지고 끝맺음이 약할 수 있습니다.', do: '아이디어 3개 중 1개만 골라 마감일을 붙이세요.' },
    4: { kw: '구축·안정', desc: '체계와 기반을 쌓는 건설자. 성실·신뢰가 강점이나, 경직되거나 변화를 늦게 받아들일 수 있습니다.', do: '규칙을 지키되 분기마다 "바꿀 규칙"을 1개 정하세요.' },
    5: { kw: '자유·변화', desc: '다양성과 모험의 탐험가. 적응력·호기심이 강점이나, 산만함과 충동을 관리할 장치가 필요합니다.', do: '변화 전 "되돌릴 길"과 손실 한도를 먼저 정하세요.' },
    6: { kw: '책임·돌봄', desc: '가정·공동체를 돌보는 조화자. 헌신·책임감이 강점이나, 과잉간섭과 자기희생을 경계합니다.', do: '돌봄의 경계를 정하고, 나를 위한 시간을 일정에 넣으세요.' },
    7: { kw: '탐구·성찰', desc: '본질을 파고드는 분석가. 통찰·전문성이 강점이나, 고립·과도한 의심을 경계합니다.', do: '혼자 검토할 시간과, 사람과 다시 연결할 날짜를 함께 정하세요.' },
    8: { kw: '성취·권한', desc: '목표와 자원을 운용하는 경영자. 추진·현실감각이 강점이나, 통제욕과 일중독을 관리해야 합니다.', do: '성과 지표와 함께 회복·위임 지표도 측정하세요.' },
    9: { kw: '완성·이상', desc: '큰 그림과 이타성을 지닌 마무리자. 포용·통찰이 강점이나, 과거에 매이거나 현실감이 흐려질 수 있습니다.', do: '끝낼 것과 보존할 것을 분리하고, 구체적 다음 단계 하나를 정하세요.' },
    11: { kw: '직관·영감(마스터)', desc: '예민한 통찰과 영감의 수. 영향력이 크나, 불안·과부하를 다룰 루틴이 필요합니다.', do: '영감을 현실 과제로 번역하는 체크리스트를 쓰세요.' },
    22: { kw: '현실화·대건설(마스터)', desc: '큰 구상을 현실로 만드는 수. 잠재력이 크나, 완벽주의와 압박을 분산할 팀이 필요합니다.', do: '비전을 분기 목표로 쪼개고 책임을 나누세요.' },
    33: { kw: '봉사·치유(마스터)', desc: '돌봄과 가르침의 수. 헌신이 크나, 자기소진을 막는 경계가 핵심입니다.', do: '도움의 총량과 회복 시간을 미리 할당하세요.' }
  };

  function compute(input) {
    var y = input.year, m = input.month, d = input.day;
    var sum = reduce(y, false) + reduce(m, false) + reduce(d, false);
    var life = reduce(sum, true);
    // 개인해수: (생월 + 생일 + 올해) 환원
    var now = input.refYear || new Date().getFullYear();
    var py = reduce(reduce(m, false) + reduce(d, false) + reduce(now, false), false);
    return {
      lifePath: life, lifeInfo: LIFE[life],
      personalYear: py, personalYearInfo: LIFE[py] || LIFE[reduce(py, false)],
      refYear: now
    };
  }

  var api = { compute: compute, reduce: reduce, LIFE: LIFE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.numerology = api;
})(typeof window !== 'undefined' ? window : globalThis);

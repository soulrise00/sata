/*
 * ziwei.js — 자미두수(紫微斗數) 간이 명반
 * 명궁·신궁과 12궁의 지지 배치를 산출(교육용). 정밀 명반은 음력 월·일·시가 필요.
 * 寅起正月 순수 생월, 생시 역수 = 명궁.
 */
(function (root) {
  'use strict';
  var BR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var BK = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  var PALACE = ['명궁(命宮)', '형제궁(兄弟)', '부처궁(夫妻)', '자녀궁(子女)', '재백궁(財帛)', '질액궁(疾厄)', '천이궁(遷移)', '노복궁(奴僕)', '관록궁(官祿)', '전택궁(田宅)', '복덕궁(福德)', '부모궁(父母)'];
  var PAL_MEAN = { '명궁(命宮)': '나·기질·전체 운', '재백궁(財帛)': '재물·수입', '관록궁(官祿)': '직업·명예', '부처궁(夫妻)': '배우자·인연', '천이궁(遷移)': '이동·대외활동', '복덕궁(福德)': '정신·복·취미' };
  // 명궁 지지별 기질
  var MYEONG = {
    0: '지혜롭고 유연하며 적응력이 뛰어납니다. 깊이 있는 통찰이 강점.',
    1: '성실하고 끈기 있으며 신뢰를 쌓습니다. 묵묵한 축적의 힘.',
    2: '진취적이고 리더십이 있으며 개척을 즐깁니다.',
    3: '온화하고 섬세하며 예술·관계 감각이 좋습니다.',
    4: '포용력과 추진력을 겸비한 든든한 중심형입니다.',
    5: '영민하고 전략적이며 표현과 설득에 능합니다.',
    6: '밝고 적극적이며 활력과 명예욕이 강합니다.',
    7: '세심하고 헌신적이며 실무와 돌봄에 강합니다.',
    8: '민첩하고 재능이 다양하며 기회 포착이 빠릅니다.',
    9: '정밀하고 완성도를 추구하며 분석력이 뛰어납니다.',
    10: '충직하고 책임감 있으며 신의를 중시합니다.',
    11: '너그럽고 복이 많으며 낙천적입니다.'
  };

  function compute(input) {
    var month = input.month;            // 양력 월(근사)
    var hourBranch = input.hour == null ? 0 : Math.floor(((input.hour % 24) + 1) / 2) % 12;
    var myeong = ((2 + (month - 1) - hourBranch) % 12 + 12) % 12;
    var sin = ((2 + (month - 1) + hourBranch) % 12 + 12) % 12;
    var palaces = [];
    for (var k = 0; k < 12; k++) {
      var br = ((myeong - k) % 12 + 12) % 12;
      palaces.push({ palace: PALACE[k], branch: br, han: BR[br], ko: BK[br], mean: PAL_MEAN[PALACE[k]] || '' });
    }
    return {
      myeongBranch: myeong, myeongHan: BR[myeong], myeongKo: BK[myeong], myeongTrait: MYEONG[myeong],
      sinBranch: sin, sinHan: BR[sin], palaces: palaces, hasHour: input.hour != null
    };
  }
  var api = { compute: compute, PALACE: PALACE, BR: BR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.ziwei = api;
})(typeof window !== 'undefined' ? window : globalThis);

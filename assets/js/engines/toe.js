/*
 * toe.js — 토정비결(土亭祕訣) 간이 신수
 * 나이·생월·생일로 괘수를 세워 올해의 총운과 월별 경향을 제시(교육용 간이판).
 */
(function (root) {
  'use strict';
  var OVERALL = [
    ['고목봉춘(枯木逢春)', '마른 나무가 봄을 만난다 — 오래 막혔던 일이 풀리고 새 기회가 옵니다. 미뤘던 일을 시작하기 좋은 해.'],
    ['금상첨화(錦上添花)', '비단 위에 꽃을 더한다 — 좋은 흐름에 겹경사가 더해집니다. 협력과 확장이 길한 해.'],
    ['태산북두(泰山北斗)', '큰 산과 북극성처럼 중심이 섭니다 — 신뢰와 명예가 오릅니다. 책임을 맡아도 좋은 해.'],
    ['우순풍조(雨順風調)', '비와 바람이 순조롭다 — 큰 굴곡 없이 안정적으로 결실을 맺는 해. 꾸준함이 복이 됩니다.'],
    ['용득여의(龍得如意)', '용이 여의주를 얻는다 — 재능이 빛을 보고 바라던 바를 이룹니다. 과감한 도전이 길한 해.'],
    ['화중군자(花中君子)', '꽃 가운데 군자 — 인덕과 신망이 두텁습니다. 사람을 통해 길이 열리는 해.'],
    ['선길후흉(先吉後凶)', '처음은 좋으나 뒤에 변수 — 상반기에 승부를 보고 하반기엔 지키는 전략이 필요합니다.'],
    ['선흉후길(先凶後吉)', '처음은 더디나 뒤에 열림 — 상반기의 인내가 하반기 결실로. 포기하지 않는 것이 핵심.'],
    ['암중모색(暗中摸索)', '어둠 속에서 길을 더듬는다 — 신중히 정보를 모으고 때를 기다릴 해. 무리한 확장은 보류.'],
    ['수화상극(水火相剋)', '물과 불이 부딪친다 — 갈등·구설 주의. 감정보다 원칙으로 대응하면 전화위복.'],
    ['평지풍파(平地風波)', '평지에 풍파 — 예기치 못한 변동이 있으나 대비하면 넘어갑니다. 재정·계약을 꼼꼼히.'],
    ['거안사위(居安思危)', '편안할 때 위기를 생각한다 — 겉은 평온하나 방심 금물. 저축과 건강 관리가 복이 됩니다.'],
    ['점입가경(漸入佳境)', '갈수록 좋아진다 — 작은 시작이 점점 커지는 해. 단계적으로 쌓으면 큰 성취.'],
    ['고진감래(苦盡甘來)', '쓴 것이 다하면 단 것이 온다 — 노력이 늦게라도 보상받습니다. 끝까지 버티세요.'],
    ['수신제가(修身齊家)', '몸과 집안을 다스린다 — 바깥 확장보다 내실·가정·건강에 투자할 해.'],
    ['대기만성(大器晩成)', '큰 그릇은 늦게 이뤄진다 — 당장의 성과보다 실력과 기반을 다지면 뒤에 크게 됩니다.']
  ];
  var MONTH_TONE = ['새 시작·계획', '관계·협력', '재물·실속', '변동·조심', '성장·확장', '결실·수확', '휴식·점검', '도전·전진', '정리·마무리', '인연·만남', '학습·준비', '결산·전환'];

  function compute(input) {
    var now = new Date();
    var refYear = input.refYear || now.getFullYear();
    var age = refYear - input.year + 1; // 세는 나이
    var sang = (age + refYear) % 8 + 1;
    var jung = (input.month) % 6 + 1;
    var ha = (input.day) % 3 + 1;
    var gwaeNum = ((sang * 100 + jung * 10 + ha) % 144) + 1;
    var idx = (sang + jung + ha + input.month + input.day) % OVERALL.length;
    var overall = OVERALL[idx];
    // 월별: 좋은 달/주의 달을 index 패턴으로
    var months = [];
    for (var m = 1; m <= 12; m++) {
      var v = (idx * 3 + m * 5 + input.day) % 10;
      var mark = v >= 7 ? '길(吉)' : (v <= 2 ? '주의' : '평');
      months.push({ m: m, tone: MONTH_TONE[(m - 1 + idx) % 12], mark: mark });
    }
    return { age: age, gwaeNum: gwaeNum, title: overall[0], overall: overall[1], months: months, refYear: refYear };
  }
  var api = { compute: compute };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.toe = api;
})(typeof window !== 'undefined' ? window : globalThis);

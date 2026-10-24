/*
 * consult.js — 상담형 설계 엔진
 * 정밀 계산이 어려운 고등 전통(삼식 등)과 현대 구조화 기법을 위한 엔진.
 * 사용자의 '고민'을 그 전통의 렌즈로 구조화하고, 되돌릴 수 있는 행동 설계로 연결한다.
 * framework: { approach, lenses:[{title,prompt}], steps:[...], caution }
 */
(function (root) {
  'use strict';
  function compute(framework, input) {
    var q = (input.q || '').trim();
    var focus = input.focus || '';
    return {
      question: q, focus: focus, framework: framework,
      lenses: framework.lenses, steps: framework.steps || defaultSteps(), approach: framework.approach, caution: framework.caution
    };
  }
  function defaultSteps() {
    return [
      '지금의 고민을 "무엇이 일어나면 해결로 볼지"가 분명한 한 문장으로 적는다.',
      '되돌릴 수 있는 작은 행동 1개를 2주 안에 실행한다(손실 한도를 미리 정한다).',
      '확인 날짜를 달력에 적고, 그날 "맞은 것·틀린 것·판단불가"를 함께 기록한다.'
    ];
  }
  var api = { compute: compute };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.consult = api;
})(typeof window !== 'undefined' ? window : globalThis);

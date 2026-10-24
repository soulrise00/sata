/*
 * guided.js — 설문형 체계 채점 (score / compose)
 */
(function (root) {
  'use strict';
  function run(spec, answers) {
    // answers: 질문별 선택 옵션 인덱스 배열
    if (spec.type === 'compose') {
      var parts = spec.questions.map(function (q, i) {
        var opt = q[1][answers[i] || 0];
        return { q: q[0], text: opt[1], label: opt[0] };
      });
      return { type: 'compose', parts: parts };
    }
    // score
    var tally = {};
    spec.axes.forEach(function (a) { tally[a] = 0; });
    spec.questions.forEach(function (q, i) {
      var opt = q[1][answers[i] || 0];
      var tag = opt[1];
      tally[tag] = (tally[tag] || 0) + 1;
    });
    if (spec.axes.join('') === 'EISNTFJP' || (spec.axes.indexOf('EI') >= 0)) {
      // MBTI: 4축 승자
      function pick(a, b) { return (tally[a] || 0) >= (tally[b] || 0) ? a : b; }
      var type = pick('E', 'I') + pick('S', 'N') + pick('T', 'F') + pick('J', 'P');
      return { type: 'score', result: type, desc: spec.results[type], tally: tally };
    }
    // enneagram: 최고 단일축
    var best = spec.axes[0];
    spec.axes.forEach(function (a) { if ((tally[a] || 0) > (tally[best] || 0)) best = a; });
    return { type: 'score', result: best, desc: spec.results[best], tally: tally };
  }
  var api = { run: run };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.guided = api;
})(typeof window !== 'undefined' ? window : globalThis);

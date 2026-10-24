/*
 * foresight.js — 현대 검증형 미래예측(전략 포사이트)
 * 원전 제6부: 기준율 → 베이즈 갱신 → 보정(calibration) → 시나리오·조기신호.
 * 전통 체계와 달리 '외부 예측타당도(P)'를 정면으로 다루는 현대 방법.
 *
 *  - 6칸 질문 운영정의(대상·사건·기간·조건·확률·반증)
 *  - 기준율에서 출발해 신호(증거)로 로그-오즈 갱신
 *  - Dator 4대 미래(지속·붕괴·규율·변혁) 분기
 *  - 되돌릴 수 있는 작은 시험 + 사후채점 설계
 */
(function (root) {
  'use strict';

  var LR = { '약': 1.5, '중': 2.3, '강': 3.5 };

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  function compute(input) {
    var p0 = clamp((input.baseRatePct == null ? 30 : input.baseRatePct) / 100, 0.01, 0.99);
    var odds = p0 / (1 - p0);
    (input.positives || []).forEach(function (s) { odds *= (LR[s] || LR['중']); });
    (input.negatives || []).forEach(function (s) { odds /= (LR[s] || LR['중']); });
    var p = odds / (1 + odds);

    // 불확실성 폭: 신호 수가 적을수록, 통제 가능성 낮을수록 넓게
    var nSig = (input.positives || []).length + (input.negatives || []).length;
    var ctrlWiden = input.controllability === 'low' ? 0.12 : (input.controllability === 'high' ? 0.05 : 0.08);
    var width = clamp(0.18 - nSig * 0.02, 0.07, 0.18) + ctrlWiden;
    var lo = clamp(p - width, 0.01, 0.99), hi = clamp(p + width, 0.01, 0.99);

    var central = Math.round(p * 100);
    var band = [Math.round(lo * 100), Math.round(hi * 100)];

    // Dator 4대 미래 — 중심확률에 따라 톤 조정
    var scenarios = [
      { key: '지속 (Grow)', icon: '📈', desc: '현재 추세가 이어진다. ' + (central >= 55 ? '가장 가능성 높은 경로 — 핵심 변수를 유지·강화하라.' : '유지만으로는 목표에 미달할 수 있다 — 추진력을 어디서 더할지 보라.') },
      { key: '붕괴 (Collapse)', icon: '📉', desc: '핵심 전제가 무너진다. 치명 실패지점(현금·건강·신뢰)을 미리 정하고 손실 한도를 둔다.' },
      { key: '규율 (Discipline)', icon: '🛡️', desc: '제약 안에서 절제·최적화한다. 자원이 한정될 때의 우선순위와 지킬 규칙을 정한다.' },
      { key: '변혁 (Transform)', icon: '✨', desc: '게임의 규칙 자체가 바뀐다(기술·제도·관계). 뒤집힐 가정과 그때의 선택지를 미리 적어 둔다.' }
    ];

    // 조기신호(사용자 입력 신호를 지표로 환산)
    var earlySignals = [];
    if (input.watchUp) earlySignals.push({ dir: 'up', text: input.watchUp });
    if (input.watchDown) earlySignals.push({ dir: 'down', text: input.watchDown });

    return {
      baseRatePct: Math.round(p0 * 100), central: central, band: band,
      shift: central - Math.round(p0 * 100),
      scenarios: scenarios, earlySignals: earlySignals,
      controllability: input.controllability || 'mid',
      sixbox: input.sixbox || null,
      // 사후채점 설계
      scoring: {
        test: '되돌릴 수 있는 작은 시험을 90일(또는 질문 기간) 안에 1개 실행',
        metric: '사건 발생 여부를 제3자도 같은 뜻으로 판정할 수 있는 지표 1개',
        review: '정한 날짜에 맞은 부분·틀린 부분·판정불가를 모두 기록(사후 맞춤 금지)'
      }
    };
  }

  // 몬테카를로(삼각분포)
  function monte(input) {
    var min = +input.min, mode = +input.mode, max = +input.max, target = +input.target;
    if (isNaN(min) || isNaN(mode) || isNaN(max) || max <= min) return { error: '최소 < 예상 < 최대 순으로 숫자를 넣어 주세요.' };
    if (isNaN(target)) target = mode;
    var runs = 10000, samples = [], hitTarget = 0;
    var fc = (mode - min) / (max - min);
    for (var i = 0; i < runs; i++) {
      var u = Math.random(), x;
      if (u < fc) x = min + Math.sqrt(u * (max - min) * (mode - min));
      else x = max - Math.sqrt((1 - u) * (max - min) * (max - mode));
      samples.push(x);
      if (x >= target) hitTarget++;
    }
    samples.sort(function (a, b) { return a - b; });
    function pct(p) { return Math.round(samples[Math.floor(p * runs)]); }
    // 히스토그램 20 bins
    var bins = 20, counts = new Array(bins).fill(0);
    samples.forEach(function (x) { var idx = Math.min(bins - 1, Math.floor((x - min) / (max - min) * bins)); counts[idx]++; });
    var maxc = Math.max.apply(null, counts);
    var hist = counts.map(function (c) { return Math.round(c / maxc * 100); });
    return { runs: runs, p10: pct(0.1), p50: pct(0.5), p90: pct(0.9), prob: Math.round(hitTarget / runs * 100), target: target, hist: hist };
  }

  var api = { compute: compute, monte: monte, LR: LR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.foresight = api;
})(typeof window !== 'undefined' ? window : globalThis);

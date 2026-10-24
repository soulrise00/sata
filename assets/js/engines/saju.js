/*
 * saju.js — 사주명리(四柱八字) 명식 엔진
 * -----------------------------------------------------------
 * 원전(제1권 제7~9장)의 계산 논리를 그대로 구현한다.
 *  1) 출생 자료 → 연·월·일·시 네 기둥(간지)
 *  2) 지장간·십신·오행 분포
 *  3) 강약(왕쇠) 근사 판단 + 억부/조후 관점의 용신 후보
 *  4) 대운(10년 운) 방향·시작나이 근사
 *
 * 보장: 재현성(R). 같은 입력 → 같은 명식.
 * 비보장: 외부사건 예측력(P). 결과는 '구조적 비유와 질문'으로 제시한다.
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;

  var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  var BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  var ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

  // 오행: 0목 1화 2토 3금 4수
  var ELEM = ['목', '화', '토', '금', '수'];
  var ELEM_EN = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  var ELEM_COLOR = ['#2e9e5b', '#e0564b', '#caa23b', '#9aa3ad', '#3a7bd5'];
  var STEM_ELEM = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  var STEM_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
  var BRANCH_ELEM = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]; // 子수 丑토 寅목 卯목 辰토 巳화 午화 未토 申금 酉금 戌토 亥수
  var BRANCH_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];

  // 지장간(본기,중기,여기) — 천간 인덱스 배열
  var HIDDEN = {
    0: [9],            // 子 癸
    1: [5, 9, 7],      // 丑 己癸辛
    2: [0, 2, 4],      // 寅 甲丙戊
    3: [1],            // 卯 乙
    4: [4, 1, 9],      // 辰 戊乙癸
    5: [2, 4, 6],      // 巳 丙戊庚
    6: [3, 5],         // 午 丁己
    7: [5, 3, 1],      // 未 己丁乙
    8: [6, 8, 4],      // 申 庚壬戊
    9: [7],            // 酉 辛
    10: [4, 7, 3],     // 戌 戊辛丁
    11: [8, 0]         // 亥 壬甲
  };

  var GODS = { bi: '비견', gy: '겁재', sik: '식신', sang: '상관', pjae: '편재', jjae: '정재', pgwan: '편관', jgwan: '정관', pin: '편인', jin: '정인' };

  // 오행 생극
  function generates(a, b) { return (a + 1) % 5 === b; }      // a生b
  function controls(a, b) { return (a + 2) % 5 === b; }       // a剋b

  // 일간(dayStem) 기준, 대상 천간(t)의 십신
  function tenGod(dayStem, t) {
    var de = STEM_ELEM[dayStem], te = STEM_ELEM[t];
    var same = STEM_YANG[dayStem] === STEM_YANG[t];
    if (de === te) return same ? GODS.bi : GODS.gy;
    if (generates(de, te)) return same ? GODS.sik : GODS.sang;   // 일간 생 → 식상
    if (controls(de, te)) return same ? GODS.pjae : GODS.jjae;   // 일간 극 → 재성
    if (controls(te, de)) return same ? GODS.pgwan : GODS.jgwan; // 대상 극 일간 → 관성
    return same ? GODS.pin : GODS.jin;                           // 대상 생 일간 → 인성
  }

  function stemObj(i) { return { han: STEMS[i], ko: STEMS_KO[i], elem: ELEM[STEM_ELEM[i]], elemIdx: STEM_ELEM[i], yang: !!STEM_YANG[i], idx: i }; }
  function branchObj(i) { return { han: BRANCHES[i], ko: BRANCHES_KO[i], elem: ELEM[BRANCH_ELEM[i]], elemIdx: BRANCH_ELEM[i], animal: ANIMALS[i], idx: i }; }

  // ── 네 기둥 계산 ───────────────────────────────────────────────
  function computePillars(y, mo, d, h, mi, tz, opts) {
    opts = opts || {};
    var jdUT = astro.julianDayUT(y, mo, d, h, mi, tz);
    var lon = astro.sunLongitude(jdUT);

    // 연주: 입춘(황경315°) 기준. 황경이 315 미만이면서 양력 1~2월 초면 전년.
    var solarYear = y;
    // 입춘 이전인지: 2월 상순 이전이고 태양황경이 315~360 영역(즉 아직 立春 전) 이면 전년
    var sector = astro.solarMonthSector(lon); // 0=寅 시작
    // 입춘 직전(황경 285~315, 즉 축월 영역) + 1~2월이면 전년도 연주
    if ((mo === 1) || (mo === 2)) {
      // 황경이 315(입춘)에 아직 못 미쳤으면 전년
      var shifted = (lon - 315 + 360) % 360;
      if (shifted >= 300 || lon < 315 && lon > 280) {
        // 축월(황경 285~315) 구간 → 아직 입춘 전
        if (lon >= 285 && lon < 315) solarYear = y - 1;
      }
    }
    // 간단·견고한 판정: 1월 전체 + 2월에서 입춘(≈황경315) 전이면 전년
    if (mo === 1) solarYear = y - 1;
    if (mo === 2 && lon >= 285 && lon < 315) solarYear = y - 1;
    if (mo === 12 && lon < 285) { /* 대설~ : 당해 유지 */ }

    var yStem = ((solarYear - 4) % 10 + 10) % 10;
    var yBranch = ((solarYear - 4) % 12 + 12) % 12;

    // 월주: 월지 = (sector + 2) % 12 (寅=2). 월간 = 五虎遁
    var mBranch = (sector + 2) % 12;
    var monthStemStart = (yStem % 5) * 2 + 2; // 寅월 천간 시작
    var k = sector; // 寅으로부터 몇 번째 절
    var mStem = (monthStemStart + k) % 10;

    // 일주: 민간 날짜(정오 기준) JDN. 야자시 옵션 시 23시 이후는 다음날.
    var dd = d, mm = mo, yy = y;
    if (opts.yajasi && h === 23) {
      // 23:00~23:59 를 다음날 子時로: 일진을 다음날로
      var nj = astro.julianDayNumber(y, mo, d) + 1;
      var e = jdnToDate(nj); yy = e.y; mm = e.m; dd = e.d;
    }
    var jdn = astro.julianDayNumber(yy, mm, dd);
    var dayIdx = ((jdn - 11) % 60 + 60) % 60;
    var dStem = dayIdx % 10;
    var dBranch = dayIdx % 12;

    // 시주: 시지 = floor((h+1)/2)%12, 시간 = 五鼠遁
    var hBranch = Math.floor(((h % 24) + 1) / 2) % 12;
    var hourStemStart = (dStem % 5) * 2;
    var hStem = (hourStemStart + hBranch) % 10;

    return {
      jdUT: jdUT, sunLon: lon, solarYear: solarYear, sector: sector,
      year: { stem: yStem, branch: yBranch },
      month: { stem: mStem, branch: mBranch },
      day: { stem: dStem, branch: dBranch },
      hour: { stem: hStem, branch: hBranch },
      hasHour: !opts.noHour
    };
  }

  function jdnToDate(jdn) {
    var a = jdn + 32044;
    var b = Math.floor((4 * a + 3) / 146097);
    var c = a - Math.floor(146097 * b / 4);
    var dd = Math.floor((4 * c + 3) / 1461);
    var e = c - Math.floor(1461 * dd / 4);
    var m = Math.floor((5 * e + 2) / 153);
    var day = e - Math.floor((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * Math.floor(m / 10);
    var year = 100 * b + dd - 4800 + Math.floor(m / 10);
    return { y: year, m: month, d: day };
  }

  // ── 오행 분포 (천간 + 지장간 가중) ──────────────────────────────
  function elementBalance(p) {
    var cnt = [0, 0, 0, 0, 0];
    var pillars = [p.year, p.month, p.day, p.hour];
    var usePillars = p.hasHour ? pillars : pillars.slice(0, 3);
    usePillars.forEach(function (pil) {
      cnt[STEM_ELEM[pil.stem]] += 1.0;            // 천간
      var hid = HIDDEN[pil.branch];
      hid.forEach(function (st, i) {
        cnt[STEM_ELEM[st]] += (i === 0 ? 1.0 : (i === 1 ? 0.5 : 0.3)); // 본기/중기/여기 가중
      });
    });
    return cnt;
  }

  // ── 강약(왕쇠) 근사: 일간을 돕는 세력(비겁+인성) vs 빼는 세력 ──────
  function strength(p) {
    var de = STEM_ELEM[p.day.stem];
    var support = 0, drain = 0;
    var pillars = p.hasHour ? [p.year, p.month, p.day, p.hour] : [p.year, p.month, p.day];
    // 월령 가중 2배
    pillars.forEach(function (pil, idx) {
      var w = (idx === 1) ? 2 : 1; // 월지 비중↑
      var se = STEM_ELEM[pil.stem];
      scoreElem(se, w);
      var hid = HIDDEN[pil.branch];
      hid.forEach(function (st, i) {
        scoreElem(STEM_ELEM[st], w * (i === 0 ? 1 : (i === 1 ? 0.5 : 0.3)));
      });
    });
    function scoreElem(e, w) {
      if (e === de || generates(e, de)) support += w; // 같은오행(비겁)·나를생함(인성)
      else drain += w;                                // 내가생/극, 나를극
    }
    var ratio = support / (support + drain);
    var label = ratio >= 0.55 ? '신강(身强)' : (ratio <= 0.42 ? '신약(身弱)' : '중화(中和)에 가까움');
    return { support: support, drain: drain, ratio: ratio, label: label };
  }

  // 조후(계절 한난조습) — 월지 기준
  function climate(p) {
    var mb = p.month.branch;
    // 겨울(亥子丑) 한, 여름(巳午未) 열, 봄(寅卯辰) 온, 가을(申酉戌) 조
    if ([11, 0, 1].indexOf(mb) >= 0) return { key: '한(寒)', desc: '차고 수렴되는 계절. 시작 에너지와 표현 통로, 체온·수면·활동 리듬을 점검.' };
    if ([5, 6, 7].indexOf(mb) >= 0) return { key: '열(熱)', desc: '과열·소모가 빠른 계절. 속도·번아웃·현금 소모를 식힐 장치를 점검.' };
    if ([2, 3, 4].indexOf(mb) >= 0) return { key: '온(溫)', desc: '뻗어나가는 계절. 어디에서 가지가 갈라지고 무엇을 연결할지 점검.' };
    return { key: '조(燥)', desc: '수렴·정리의 계절. 무엇을 수확하고 무엇을 잘라낼지 점검.' };
  }

  // 용신(억부 중심) 후보 — 교육용 근사
  function usefulElement(p, st) {
    var de = STEM_ELEM[p.day.stem];
    if (st.ratio >= 0.55) {
      // 신강 → 설기(식상)·극(재·관)로 덜어냄
      return { view: '억부(抑扶)', candidates: [ELEM[(de + 1) % 5], ELEM[(de + 2) % 5]], why: '일간을 돕는 세력이 넉넉하므로, 에너지를 쓰고(식상) 관리·결실(재·관)로 흐르게 하는 오행이 균형에 기여할 수 있습니다.' };
    } else if (st.ratio <= 0.42) {
      // 신약 → 생조(인성)·부조(비겁)
      return { view: '억부(抑扶)', candidates: [ELEM[(de + 4) % 5], ELEM[de]], why: '일간을 돕는 세력이 얕으므로, 나를 길러 주는 자원(인성)과 같은 편(비겁)에 해당하는 오행이 기반을 보강할 수 있습니다.' };
    }
    return { view: '조후·통관', candidates: [ELEM[de]], why: '세력이 중화에 가까워 특정 오행을 한쪽으로 몰기보다, 계절 조건(조후)과 막힌 흐름을 잇는 통관을 함께 봅니다.' };
  }

  // 대운 방향·시작나이 근사
  function luckPillars(p, gender, y, mo, d, h, mi, tz) {
    // 방향: (연간 양 & 남) 또는 (연간 음 & 여) → 순행, else 역행
    var yangYear = !!STEM_YANG[p.year.stem];
    var male = (gender === 'male' || gender === 'M' || gender === '남');
    var forward = (yangYear && male) || (!yangYear && !male);
    // 시작나이: 출생~인접 절까지 일수 / 3 (3일=1년) 근사
    var jd = astro.julianDayUT(y, mo, d, h, mi, tz);
    var curSectorLon = 315 + p.sector * 30;
    var nextSectorLon = curSectorLon + 30;
    var prevSectorLon = curSectorLon;
    var days;
    if (forward) {
      var jdNext = astro.jdAtSunLongitude(((nextSectorLon) % 360), jd + 15);
      days = jdNext ? (jdNext - jd) : 15;
    } else {
      var jdPrev = astro.jdAtSunLongitude(((prevSectorLon) % 360), jd - 15);
      days = jdPrev ? (jd - jdPrev) : 15;
    }
    var startAge = Math.max(1, Math.round((days / 3) * 10) / 10);
    // 대운 간지: 월주에서 순/역으로 진행
    var list = [];
    for (var i = 1; i <= 8; i++) {
      var step = forward ? i : -i;
      var sIdx = ((p.month.stem + step) % 10 + 10) % 10;
      var bIdx = ((p.month.branch + step) % 12 + 12) % 12;
      list.push({ age: Math.round(startAge + (i - 1) * 10), stem: sIdx, branch: bIdx });
    }
    return { forward: forward, startAge: startAge, pillars: list };
  }

  // ── 종합 계산 ──────────────────────────────────────────────────
  function compute(input) {
    // input: {year,month,day,hour,minute,tz,gender,noHour,yajasi}
    var tz = (input.tz == null) ? 9 : input.tz;
    var p = computePillars(input.year, input.month, input.day,
      input.noHour ? 12 : (input.hour || 0), input.minute || 0, tz,
      { noHour: input.noHour, yajasi: input.yajasi });

    var bal = elementBalance(p);
    var st = strength(p);
    var cl = climate(p);
    var useful = usefulElement(p, st);
    var luck = (input.gender && !input.noHour !== undefined) ?
      luckPillars(p, input.gender, input.year, input.month, input.day, input.hour || 0, input.minute || 0, tz) : null;
    if (input.gender) luck = luckPillars(p, input.gender, input.year, input.month, input.day, input.hour || 0, input.minute || 0, tz);

    // 십신 집계 (천간 4 + 지장간 본기)
    var godCount = {};
    Object.keys(GODS).forEach(function (k) { godCount[GODS[k]] = 0; });
    var pillars = p.hasHour ? [p.year, p.month, p.day, p.hour] : [p.year, p.month, p.day];
    pillars.forEach(function (pil, idx) {
      if (idx !== 2) { // 일간 자신 제외
        godCount[tenGod(p.day.stem, pil.stem)]++;
      }
      var mainHidden = HIDDEN[pil.branch][0];
      godCount[tenGod(p.day.stem, mainHidden)]++;
    });

    return {
      input: input, pillars: p, dayMaster: stemObj(p.day.stem),
      balance: bal, strength: st, climate: cl, useful: useful,
      luck: luck, godCount: godCount,
      pillarDetail: {
        year: pillarDetail(p, 'year'), month: pillarDetail(p, 'month'),
        day: pillarDetail(p, 'day'), hour: p.hasHour ? pillarDetail(p, 'hour') : null
      }
    };
  }

  function pillarDetail(p, key) {
    var pil = p[key];
    var hid = HIDDEN[pil.branch].map(function (s) { return STEMS[s]; });
    return {
      stem: stemObj(pil.stem), branch: branchObj(pil.branch),
      stemGod: key === 'day' ? '일간(日干)' : tenGod(p.day.stem, pil.stem),
      hiddenStems: hid,
      hiddenGods: HIDDEN[pil.branch].map(function (s) { return tenGod(p.day.stem, s); })
    };
  }

  var api = {
    compute: compute, tenGod: tenGod, STEMS: STEMS, STEMS_KO: STEMS_KO,
    BRANCHES: BRANCHES, BRANCHES_KO: BRANCHES_KO, ANIMALS: ANIMALS,
    ELEM: ELEM, ELEM_EN: ELEM_EN, ELEM_COLOR: ELEM_COLOR,
    stemObj: stemObj, branchObj: branchObj
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.saju = api;
})(typeof window !== 'undefined' ? window : globalThis);

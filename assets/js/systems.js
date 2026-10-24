/*
 * systems.js — 체계 레지스트리
 *  INTERACTIVE: 실제 계산·체험이 되는 11개 (아이콘 클릭 → 체험)
 *  ATLAS: 원전 41개 체계 전체 목록(도감) — 비대화형 항목 포함
 */
(function (root) {
  'use strict';

  // 공통 입력 조각
  var fBirth = { type: 'date', key: 'birth', label: '생년월일 (양력)', required: true };
  var fTime = { type: 'time', key: 'time', label: '태어난 시각 (모르면 비움)', hint: '시각을 모르면 시주/상승점은 읽지 않습니다(원전 원칙).' };
  var fTz = { type: 'select', key: 'tz', label: '표준시', options: [['9', '한국/일본 (UTC+9)'], ['8', '중국/대만 (UTC+8)'], ['0', '영국 (UTC+0)'], ['-5', '미국 동부 (UTC-5)'], ['-8', '미국 서부 (UTC-8)'], ['5.5', '인도 (UTC+5:30)']], default: '9' };
  var fGender = { type: 'seg', key: 'gender', label: '성별 (대운 방향 계산용)', options: [['male', '남성'], ['female', '여성']], default: 'male' };
  var fQ = { type: 'textarea', key: 'q', label: '지금 가장 궁금한 질문', hint: '"될까요?" 대신 대상·사건·기간이 담긴 한 문장이 좋습니다.', placeholder: '예) 올해 안에 지금 준비하는 이직을 실제로 실행하게 될까?' };

  var INTERACTIVE = [
    {
      id: 'saju', name: '사주명리', han: '四柱命理', icon: 'saju', cat: '동아시아',
      blurb: '태어난 연·월·일·시를 간지로 바꾼 여덟 글자로 타고난 기질의 구조와 때의 흐름을 읽습니다.',
      grades: { H: 3, R: 3, P: 1, C: 2, X: 2 }, engine: 'saju',
      fields: [fBirth, fTime, fGender, fTz, { type: 'seg', key: 'yajasi', label: '자시(밤 11시 이후) 처리', options: [['0', '당일(조자시)'], ['1', '익일(야자시)']], default: '0' }, fQ]
    },
    {
      id: 'iching', name: '주역', han: '周易', icon: 'iching', cat: '동아시아',
      blurb: '질문을 여섯 층의 상태와 변화로 나누어 읽습니다. 동전 여섯 번으로 괘를 세웁니다.',
      grades: { H: 3, R: 3, P: 1, C: 3, X: 2 }, engine: 'iching',
      fields: [fQ]
    },
    {
      id: 'plum', name: '매화역수', han: '梅花易數', icon: 'plum', cat: '동아시아',
      blurb: '수와 시간으로 괘를 세우고, 체(나)와 용(환경)의 생극으로 국면의 흐름을 봅니다.',
      grades: { H: 2, R: 3, P: 0, C: 2, X: 2 }, engine: 'plum',
      fields: [fQ, { type: 'seg', key: 'mode', label: '괘 세우는 법', options: [['time', '지금 시각으로'], ['num', '직접 두 수 입력']], default: 'time' },
        { type: 'number', key: 'n1', label: '첫째 수 (상괘)', showIf: ['mode', 'num'], placeholder: '1~99' },
        { type: 'number', key: 'n2', label: '둘째 수 (하괘)', showIf: ['mode', 'num'], placeholder: '1~99' }]
    },
    {
      id: 'western', name: '서양 점성술', han: 'Astrology', icon: 'western', cat: '서양·근동',
      blurb: '태어난 순간 태양의 황도 위치로 별자리·원소·양식의 기본 성향을 봅니다.',
      grades: { H: 3, R: 3, P: 1, C: 2, X: 2 }, engine: 'western',
      fields: [fBirth, fTime, fTz, fQ]
    },
    {
      id: 'tarot', name: '타로', han: 'Tarot', icon: 'tarot', cat: '서양·근동',
      blurb: '78장의 수트·숫자·인물·위치 문법으로 현재 선택을 구조화합니다. 미래 확정이 아닌 질문의 재구성입니다.',
      grades: { H: 2, R: 2, P: 0, C: 3, X: 2 }, engine: 'tarot',
      fields: [fQ, { type: 'seg', key: 'spread', label: '배열', options: [['three', '3장 (상황·장애·조언)'], ['situation', '5장 (흐름 읽기)']], default: 'three' }]
    },
    {
      id: 'runes', name: '룬', han: 'Runes', icon: 'runes', cat: '서양·근동',
      blurb: '엘더 푸사르크 24개 룬을 뽑아 지금 집중할 주제와 조언을 읽습니다.',
      grades: { H: 2, R: 2, P: 0, C: 2, X: 2 }, engine: 'runes',
      fields: [fQ, { type: 'seg', key: 'spread', label: '배열', options: [['one', '1룬 (오늘의 조언)'], ['three', '3룬 (배경·현재·전개)']], default: 'three' }]
    },
    {
      id: 'lenormand', name: '르노르망', han: 'Lenormand', icon: 'lenormand', cat: '서양·근동',
      blurb: '36장을 조합해 하나의 문장처럼 흐름을 읽는 근세 유럽의 카드점입니다.',
      grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'lenormand',
      fields: [fQ, { type: 'seg', key: 'spread', label: '배열', options: [['three', '3장 (지금·전개·결과)'], ['five', '5장 (확장)']], default: 'three' }]
    },
    {
      id: 'numerology', name: '수비학', han: 'Numerology', icon: 'numerology', cat: '서양·근동',
      blurb: '생년월일의 수를 환원해 생명경로수와 올해의 개인해수를 봅니다.',
      grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'numerology',
      fields: [fBirth]
    },
    {
      id: 'biorhythm', name: '생체리듬', han: 'Biorhythm', icon: 'biorhythm', cat: '현대·검증',
      blurb: '신체·감성·지성의 세 주기를 계산합니다. 주기는 정확하지만 성과 예측력은 연구에서 지지되지 않습니다.',
      grades: { H: 1, R: 3, P: 0, C: 1, X: 1 }, engine: 'biorhythm',
      fields: [fBirth, { type: 'date', key: 'target', label: '보고 싶은 날짜', hint: '비우면 오늘로 계산합니다.' }]
    },
    {
      id: 'zodiac', name: '띠·십이지', han: '十二支', icon: 'zodiac', cat: '동아시아',
      blurb: '태어난 해의 지지로 열두 동물의 기질과 삼합·육합·충의 관계를 봅니다.',
      grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'zodiac',
      fields: [fBirth]
    },
    {
      id: 'foresight', name: '현대 미래예측', han: 'Foresight', icon: 'foresight', cat: '현대·검증',
      blurb: '기준율에서 출발해 신호로 확률을 갱신하고, 4대 미래 시나리오와 조기신호로 준비합니다. 적중을 검증하는 현대 방법.',
      grades: { H: 1, R: 3, P: 2, C: 3, X: 1 }, engine: 'foresight',
      fields: [
        { type: 'textarea', key: 'event', label: '① 사건 — 무엇이 일어나면 "발생"인가', placeholder: '예) 3개월 연속 월 매출 500만원 이상' },
        { type: 'text', key: 'horizon', label: '② 기간 — 언제까지', placeholder: '예) 2027년 6월 30일까지' },
        { type: 'range', key: 'base', label: '③ 기준율 — 비슷한 사례의 과거 성공률(%)', min: 1, max: 99, default: 30, hint: '자료가 없으면 느낌이 아니라 "모름(30% 부근)"에서 시작하세요.' },
        { type: 'signals', key: 'signals', label: '④ 신호 — 확률을 올리거나 내리는 증거' },
        { type: 'seg', key: 'controllability', label: '⑤ 통제 가능성', options: [['low', '낮음'], ['mid', '보통'], ['high', '높음']], default: 'mid' }
      ]
    }
  ];

  // 전체 41개 체계 (원전 목차) — 대화형은 live:true
  var ATLAS = [
    { part: '동아시아 미래예측학', items: [
      ['1. 주역 점법', '周易·易經', '변화의 구조를 여섯 효로 읽는 동아시아의 근간', 'iching'],
      ['2. 육효·납갑법', '六爻·納甲', '괘의 각 효에 간지·오행·육친을 배정해 사건을 분석'],
      ['3. 매화역수', '梅花易數', '수·시간으로 괘를 세워 체용 생극으로 판단', 'plum'],
      ['4. 사주팔자·자평명리', '四柱八字', '생년월일시의 여덟 글자로 기질과 운의 흐름을 읽음', 'saju'],
      ['5. 자미두수', '紫微斗數', '열두 궁에 별을 배치해 삶의 영역별 구조를 봄'],
      ['6. 칠정사여', '七政四餘', '해·달·오행성과 네 허성을 쓰는 중국 전통 점성'],
      ['7. 기문둔갑', '奇門遁甲', '시공의 국(局)을 세워 방위·때의 유불리를 가름'],
      ['8. 대육임', '大六壬', '천반·지반과 사과삼전으로 사건을 추론'],
      ['9. 태을신수', '太乙神數', '장기 주기와 국운을 보는 삼식(三式)의 하나'],
      ['10. 풍수지리', '風水·形勢·理氣', '땅·건물의 형세와 방위를 사람과 연결'],
      ['11. 택일·일진', '擇日', '행동을 시작할 좋은 날과 때를 고름'],
      ['12. 관상·수상·성명학', '觀相·姓名', '얼굴·손·이름의 상징으로 기질을 해석'],
      ['13. 한국 신점·토정비결', '土亭祕訣', '민속 점복과 세시의 운세 전통', 'soon'],
      ['14. 일본 음양도·구성기학', '陰陽道', '사주추명·구성학·숙요 등 일본 전통'],
      ['15. 베트남 뜨비·보이끼에우', 'Tử Vi', '동아시아 명리의 베트남식 전개']
    ]},
    { part: '인도·티베트·동남아시아', items: [
      ['16. 인도 조티샤', 'Jyotiṣa', '항성황도·나크샤트라·다샤의 인도 출생점성'],
      ['17. 빔쇼타리 다샤·분할차트', 'Daśā·Varga', '행성 기간과 분할차트로 때를 읽는 심화'],
      ['18. 프라슈나 질문점', 'Praśna', '질문 시각의 차트로 사건을 판단'],
      ['19. 무후르타·바스투', 'Muhūrta·Vāstu', '인도의 택일과 공간 배치'],
      ['20. 자이미니·나디·KP', 'Jaimini·Nāḍi', '인도 특수학파의 비교'],
      ['21. 티베트 점성술', 'dkar/nag rtsis', '칼라차크라·오행을 결합한 복합 전통'],
      ['22. 티베트 모점·신탁', 'Mo', '주사위·염주로 불교 의례와 연결된 질문점'],
      ['23. 동남아시아 점성', 'SEA Astrology', '미얀마·태국·라오스·캄보디아의 전통'],
      ['24. 자바 프림본·발리 와리가', 'Primbon·Wariga', '인도네시아의 역일·운세 전통']
    ]},
    { part: '고대 근동·지중해·유럽·이슬람권', items: [
      ['25. 메소포타미아 천체징조', 'Omina', '천체·간·꿈의 징조를 읽은 가장 오랜 기록'],
      ['26. 이집트·그리스 신탁', 'Oracle', '신탁·꿈점·제비뽑기(클레로맨시)'],
      ['27. 헬레니즘 출생점성술', 'Hellenistic', '서양 출생점성의 기술적 토대'],
      ['28. 중세·르네상스 점성술', 'Astrology', '품위·섹트·시간기법의 정교화', 'western'],
      ['29. 서양 호라리 점성술', 'Horary', '질문 시각의 천궁도로 구체적 사건 판단'],
      ['30. 택일·문데인·금융 점성', 'Mundane', '국가·시장·날씨를 보는 시도(검증 난이도 큼)'],
      ['31. 현대 심리·진화 점성', 'Modern', '심리·인본·우라니안 등 20세기 흐름'],
      ['32. 타로', 'Tarot', '78장의 상징으로 선택을 구조화', 'tarot'],
      ['33. 르노르망·시빌라', 'Lenormand', '근세 유럽의 조합형 카드점', 'lenormand'],
      ['34. 서양 지오맨시·아랍 라믈', 'Geomancy·Raml', '점을 찍어 16형상으로 읽는 토점', 'soon'],
      ['35. 룬·오검·켈트 점복', 'Runes·Ogham', '게르만·켈트 문자 상징의 현대 점복', 'runes'],
      ['36. 수비학·게마트리아', 'Numerology', '문자·수의 상징 수리', 'numerology'],
      ['37. 이슬람권 점성·자프르', 'Jafr', '점성·문자수리·서점(이스티카라)'],
      ['38. 스크라잉·채널링', 'Scrying', '거울·진자·영매 등 매체 기반 전통']
    ]},
    { part: '아프리카·메소아메리카·토착', items: [
      ['39. 요루바 이파', 'Ifá', '오두·오펠레·이킨을 쓰는 서아프리카 신탁'],
      ['40. 아프리카 뼈·조개 점복', 'Bone/Shell', '던진 물상의 배치로 읽는 토착 점복'],
      ['41. 마야·아즈텍 달력점', 'Tōnalpōhualli', '260일 달력과 토착 생태예측']
    ]},
    { part: '현대의 검증형 미래예측', items: [
      ['· 기준율과 비교기준', 'Base rate', '모든 예측의 출발점이 되는 과거 발생률', 'foresight'],
      ['· 시계열·베이즈 갱신', 'Forecasting', '추세·계절성과 증거에 따른 확률 갱신', 'foresight'],
      ['· 시나리오·조기신호', 'Scenarios', '여러 미래를 준비하고 신호로 수정', 'foresight'],
      ['· 생체리듬(참고)', 'Biorhythm', '주기는 재현되나 예측력은 미지지', 'biorhythm'],
      ['· 집단예측·AI 예측', 'Collective/AI', '전문가 집단과 알고리즘의 역할과 한계']
    ]}
  ];

  var api = { INTERACTIVE: INTERACTIVE, ATLAS: ATLAS, byId: {} };
  INTERACTIVE.forEach(function (s) { api.byId[s.id] = s; });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.systems = api;
})(typeof window !== 'undefined' ? window : globalThis);

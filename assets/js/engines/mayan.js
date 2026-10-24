/*
 * mayan.js — 마야 달력점 (쫄킨 260일 + 하압 365일 + 장기력)
 * GMT 상관수 584283 기준. 날짜만으로 완전히 재현 가능(R 높음).
 * 원전 제5권(제4부) 41장: 달력 계산은 재현 가능, 점술 해석은 문화 상징.
 */
(function (root) {
  'use strict';
  var astro = (typeof require !== 'undefined') ? require('./astro.js') : root.FL.astro;
  var GMT = 584283;

  // [이름, 별칭, 키워드, 해설]
  var SIGNS = [
    ['임시', '악어', '원천·양육', '모든 것이 시작되는 원초의 물. 돌보고 길러내는 어머니의 에너지.'],
    ['이크', '바람', '영감·소통', '생명의 숨과 영감. 말과 아이디어를 세상에 불어넣는다.'],
    ['아크발', '밤', '내면·꿈', '어둠 속의 신비와 무의식. 내면으로 들어가 답을 찾는다.'],
    ['칸', '씨앗', '성장·잠재', '심어진 씨앗의 잠재력. 때를 기다려 결실로 키운다.'],
    ['치크찬', '뱀', '생명력·본능', '척추를 타고 오르는 생명 에너지와 본능적 지혜.'],
    ['키미', '죽음', '전환·해방', '끝과 변형. 놓아주어야 새것이 들어온다.'],
    ['마니크', '사슴', '치유·협력', '내미는 손과 치유. 함께 이루는 조화.'],
    ['라마트', '별·토끼', '조화·풍요', '별빛의 조화와 다산. 예술과 아름다움.'],
    ['물루크', '물', '감정·정화', '달과 물의 감정. 공명하고 정화한다.'],
    ['오크', '개', '충실·사랑', '변함없는 사랑과 안내. 길을 함께 걷는 동반.'],
    ['추엔', '원숭이', '유희·창조', '장난과 창조. 놀이로 세상을 짓는다.'],
    ['에브', '길·인간', '여정·운명', '인생의 길과 겸손. 매일의 선택이 운명을 만든다.'],
    ['벤', '갈대', '성장·탐험', '하늘과 땅을 잇는 기둥. 원칙과 탐험.'],
    ['익스', '재규어', '마법·직관', '밤의 마법과 직관. 시간의 흐름을 읽는다.'],
    ['멘', '독수리', '비전·초월', '높이 나는 시야와 큰 마음. 전체를 조망한다.'],
    ['킵', '전사·부엉이', '지혜·용서', '조상의 지혜와 용서. 짐을 내려놓는 법.'],
    ['카반', '땅', '지성·동기화', '움직이는 지성과 땅의 리듬. 동기화의 힘.'],
    ['에츠납', '거울', '진실·반사', '흑요석 거울의 진실. 비추어 분별한다.'],
    ['카와크', '폭풍', '정화·변형', '폭풍의 에너지로 낡은 것을 씻어낸다.'],
    ['아하우', '태양·꽃', '깨달음·완성', '태양의 빛과 완성. 사랑으로 피어나는 깨달음.']
  ];
  var TONES = [
    ['통일', '의도를 하나로 모은다'], ['양극', '도전과 관계를 통해 나아간다'], ['활성', '움직여 봉사한다'],
    ['척도', '형태와 안정을 세운다'], ['중심', '권능을 모아 명령한다'], ['유기', '흐름에 맞춰 균형을 잡는다'],
    ['공명', '조율하고 영감을 받는다'], ['조화', '통합하고 본보기가 된다'], ['맥박', '의도를 현실로 실현한다'],
    ['현현', '결실을 드러내 완성한다'], ['해방', '놓아주고 풀어낸다'], ['협력', '헌신으로 안정시킨다'],
    ['초월', '임재하여 넘어선다']
  ];
  var MONTHS = ['Pop', 'Wo', 'Sip', 'Sotz', 'Sek', 'Xul', 'Yaxkin', 'Mol', 'Chen', 'Yax', 'Sak', 'Keh', 'Mak', 'Kankin', 'Muwan', 'Pax', 'Kayab', 'Kumku', 'Wayeb'];

  function compute(input) {
    var jdn = astro.julianDayNumber(input.year, input.month, input.day);
    var delta = jdn - GMT;
    function mod(n, m) { return ((n % m) + m) % m; }
    var tone = mod(delta + 3, 13) + 1;           // 1~13
    var sign = mod(delta + 19, 20);              // 0=Imix .. 19=Ahau
    var haab = mod(delta + 348, 365);
    var hMonth = Math.floor(haab / 20), hDay = haab % 20;
    var kin = mod(delta, 20), winal = mod(Math.floor(delta / 20), 18),
      tun = mod(Math.floor(delta / 360), 20), katun = mod(Math.floor(delta / 7200), 20),
      baktun = Math.floor(delta / 144000);
    return {
      tone: tone, toneInfo: TONES[tone - 1], signIdx: sign, sign: SIGNS[sign],
      kinNumber: mod(delta, 260) + 1,
      haabDay: hDay, haabMonth: MONTHS[hMonth] || 'Wayeb',
      longCount: baktun + '.' + katun + '.' + tun + '.' + winal + '.' + kin,
      tzolkin: tone + ' ' + SIGNS[sign][0]
    };
  }
  var api = { compute: compute, SIGNS: SIGNS, TONES: TONES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.mayan = api;
})(typeof window !== 'undefined' ? window : globalThis);

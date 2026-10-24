/*
 * systems.js — 체계 레지스트리 (v2, 100+ 체계 · 8 카테고리)
 * 각 체계: id,name,han,glyph,grad,blurb,grades,engine,(mode/method/deck/spec/framework),fields
 * 모든 체계가 클릭 시 실제 체험(계산/추출/프로필/설문/상담)으로 연결된다.
 */
(function (root) {
  'use strict';
  // 입력 조각
  var Fb = { type: 'date', key: 'birth', label: '생년월일 (양력)', required: true };
  var Ft = { type: 'time', key: 'time', label: '태어난 시각 (모르면 비움)', hint: '시각을 모르면 시주·상승점·분할은 읽지 않습니다(원전 원칙).' };
  var Fz = { type: 'select', key: 'tz', label: '표준시', options: [['9', '한국/일본 (UTC+9)'], ['8', '중국/대만 (UTC+8)'], ['0', '영국 (UTC+0)'], ['-5', '미국 동부 (UTC-5)'], ['-8', '미국 서부 (UTC-8)'], ['5.5', '인도 (UTC+5:30)']], default: '9' };
  var Fg = { type: 'seg', key: 'gender', label: '성별 (운 방향 계산용)', options: [['male', '남성'], ['female', '여성']], default: 'male' };
  function Fq(ph) { return { type: 'textarea', key: 'q', label: '지금 가장 궁금한 고민/질문', hint: '"될까요?" 대신 대상·사건·기간이 담긴 한 문장이면 더 정확한 설계가 나옵니다.', placeholder: ph || '예) 올해 안에 지금 준비하는 이직을 실제로 실행하게 될까?' }; }
  var Fb2 = { type: 'date', key: 'birth2', label: '상대방 생년월일 (양력)', required: true };
  var Fname = { type: 'text', key: 'name', label: '이름 (한글)', placeholder: '예) 홍길동' };
  var FnameEn = { type: 'text', key: 'name', label: '이름 (영문)', placeholder: '예) GILDONG' };
  var Ftarget = { type: 'date', key: 'target', label: '보고 싶은 날짜 (비우면 오늘)' };
  var FdateOpt = { type: 'date', key: 'date', label: '날짜 (비우면 오늘)' };
  function quiz(spec) { return { type: 'quiz', key: 'answers', spec: spec }; }
  function draw(ph) { return Fq(ph); }

  // consult 프레임워크 생성기
  function fw(approach, lenses, caution, steps) { return { approach: approach, lenses: lenses, caution: caution, steps: steps }; }

  var CATS = [
    { key: 'east', label: '동아시아 명리', desc: '사주·자미두수에서 궁합·택일까지, 간지와 오행으로 읽는 동아시아 운명학.', items: [
      { id: 'saju', name: '사주명리', han: '四柱命理', glyph: 'svg:pillars', grad: 0, blurb: '태어난 연·월·일·시 여덟 글자로 타고난 기질의 구조와 때의 흐름을 읽습니다.', grades: { H: 3, R: 3, P: 1, C: 2, X: 2 }, engine: 'saju', fields: [Fb, Ft, Fg, Fz, { type: 'seg', key: 'yajasi', label: '자시(밤11시~) 처리', options: [['0', '당일'], ['1', '익일']], default: '0' }, Fq()] },
      { id: 'ziwei', name: '자미두수', han: '紫微斗數', glyph: '紫', grad: 6, blurb: '열두 궁(命·財·官·夫妻…)에 별자리를 배치해 삶의 영역별 구조를 봅니다.', grades: { H: 3, R: 2, P: 0, C: 2, X: 2 }, engine: 'ziwei', fields: [Fb, Ft, Fq()] },
      { id: 'gusung', name: '구성기학', han: '九星氣學', glyph: '九', grad: 4, blurb: '태어난 해의 본명성(1~9)으로 기질과 방위의 기운을 읽습니다.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'gusung', fields: [Fb] },
      { id: 'dangsaju', name: '당사주', han: '唐四柱', glyph: '唐', grad: 8, blurb: '열두 별(천귀·천복·천예…)로 보는 타고난 성정과 삶의 결.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'dangsaju', fields: [Fb] },
      { id: 'toe', name: '토정비결', han: '土亭祕訣', glyph: '土', grad: 19, blurb: '나이·생월·생일로 괘를 세워 올해의 총운과 월별 흐름을 봅니다.', grades: { H: 2, R: 3, P: 0, C: 2, X: 2 }, engine: 'toe', fields: [Fb] },
      { id: 'zodiac', name: '띠·십이지', han: '十二支', glyph: '🐲', grad: 2, blurb: '태어난 해의 지지로 열두 동물의 기질과 삼합·육합·충을 봅니다.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'zodiac', fields: [Fb] },
      { id: 'samjae', name: '삼재 점검', han: '三災', glyph: '災', grad: 11, blurb: '내 띠의 삼재 3년과 올해 삼재 여부(들·눌·날)를 확인합니다.', grades: { H: 3, R: 3, P: 0, C: 1, X: 2 }, engine: 'samjae', fields: [Fb] },
      { id: 'compat-saju', name: '사주 궁합', han: '宮合', glyph: '合', grad: 9, blurb: '두 사람의 일간 오행과 일지 관계로 보는 궁합.', grades: { H: 3, R: 3, P: 0, C: 2, X: 2 }, engine: 'relationship', method: 'saju', fields: [Fb, Fb2, Fq('예) 이 사람과 결혼까지 갈 수 있을까?')] },
      { id: 'compat-zodiac', name: '띠 궁합', han: '띠宮合', glyph: '🐰', grad: 10, blurb: '두 사람 띠의 삼합·육합·충으로 보는 간단 궁합.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'relationship', method: 'zodiac', fields: [Fb, Fb2] },
      { id: 'iljin', name: '오늘의 일진', han: '日辰', glyph: '日', grad: 14, blurb: '오늘(또는 특정일)의 간지와 오행으로 보는 활동 길흉.', grades: { H: 3, R: 3, P: 0, C: 2, X: 1 }, engine: 'iljin', fields: [FdateOpt, Fq('예) 오늘 중요한 미팅을 잡아도 될까?')] },
      { id: 'taekil', name: '택일', han: '擇日', glyph: '擇', grad: 15, blurb: '행동을 시작할 날의 간지 기운을 확인합니다.', grades: { H: 3, R: 3, P: 0, C: 2, X: 1 }, engine: 'iljin', fields: [FdateOpt, Fq('예) 이 날 계약을 해도 좋을까?')] },
      { id: 'seongmyeong', name: '성명학', han: '姓名學', glyph: '姓', grad: 20, blurb: '한글 이름의 획수로 사격(원·형·이·정)과 81수리 길흉을 봅니다.', grades: { H: 2, R: 2, P: 0, C: 1, X: 2 }, engine: 'seongmyeong', fields: [Fname, { type: 'seg', key: 'surlen', label: '성(姓) 글자 수', options: [['1', '한 자 (예: 김)'], ['2', '두 자 (예: 남궁)']], default: '1' }] },
      { id: 'gimun', name: '기문둔갑', han: '奇門遁甲', glyph: '遁', grad: 17, blurb: '시공의 국(局)으로 방위·때의 유불리를 가르는 삼식(三式). 고민에 맞춘 방위·타이밍 설계.', grades: { H: 3, R: 1, P: 0, C: 2, X: 2 }, engine: 'consult', fields: [Fq('예) 중요한 담판을 어느 방향·시점에 잡을까?'), { type: 'seg', key: 'focus', label: '용사(목적)', options: [['사업', '사업·재물'], ['관계', '관계·담판'], ['이동', '이동·여행'], ['학업', '학업·시험']], default: '사업' }],
        framework: fw('기문둔갑은 "때와 방위의 유리함"을 설계하는 기술입니다. 정밀 국(局) 계산 대신, 당신의 목적에 맞는 길방·시점 전략으로 구조화합니다.', [
          { title: '방위(方位)', prompt: '핵심 상대·기회가 있는 방향으로 먼저 움직이고 있나요? 중요한 만남은 당신이 "맞이하는" 자리를 택하세요.' },
          { title: '때(時)', prompt: '서둘러야 할 일과 기다려야 할 일을 섞고 있지 않나요? 오전의 맑은 기운에 중대한 결정을, 늦은 시간엔 수습을.' },
          { title: '기세(機)', prompt: '지금은 공격(생문)의 때인가, 수비(두문)의 때인가? 하나를 정하면 자원이 집중됩니다.' }
        ], '방위·시점은 보조 변수입니다. 핵심 실력·준비가 먼저이며, 유리한 때는 그 위에 얹는 가산점입니다.') },
      { id: 'daeyukim', name: '대육임', han: '大六壬', glyph: '壬', grad: 13, blurb: '천반·지반과 사과삼전으로 사건의 전개를 추론하는 삼식. 질문 구조화 상담.', grades: { H: 3, R: 1, P: 0, C: 2, X: 2 }, engine: 'consult', fields: [Fq('예) 지금 이 문제가 앞으로 어떻게 전개될까?')],
        framework: fw('대육임은 "사건의 주체·대상·전개"를 삼전(三傳: 초·중·말)으로 나눠 봅니다. 당신의 고민을 세 단계 흐름으로 설계합니다.', [
          { title: '초전(初傳) — 발단', prompt: '지금 이 일을 촉발한 진짜 원인 한 가지는 무엇인가요?' },
          { title: '중전(中傳) — 과정', prompt: '해결로 가는 길목에 놓인 핵심 장애 한 가지는?' },
          { title: '말전(末傳) — 귀결', prompt: '아무것도 바꾸지 않으면 3개월 뒤 어디에 도달하나요?' }
        ], '전개 예측은 가설입니다. 가장 약한 고리(중전)에 작은 개입을 시도하고 결과를 기록하세요.') },
      { id: 'taeeul', name: '태을신수', han: '太乙神數', glyph: '乙', grad: 18, blurb: '장기 주기와 큰 흐름(국운·시대)을 보는 삼식. 거시 시야 설계.', grades: { H: 3, R: 1, P: 0, C: 1, X: 2 }, engine: 'consult', fields: [Fq('예) 지금의 큰 변화 흐름에서 나는 무엇을 준비해야 할까?')],
        framework: fw('태을은 "큰 주기와 거시 흐름"을 봅니다. 당신의 고민을 5~10년 단위의 시대 흐름 위에 놓아 설계합니다.', [
          { title: '시대의 바람', prompt: '당신의 분야에서 지난 3년간 가장 크게 바뀐 구조적 변화는?' },
          { title: '나의 위치', prompt: '그 변화의 수혜자 쪽인가요, 피해자 쪽인가요? 어느 쪽으로 이동할 수 있나요?' },
          { title: '10년 뒤', prompt: '10년 뒤에도 가치 있을 역량 하나를 지금 쌓고 있나요?' }
        ], '거시 예측은 빗나가기 쉽습니다. 큰 방향만 잡고, 분기마다 현실 신호로 수정하세요.') }
    ]},

    { key: 'oracle', label: '역(易)·괘점', desc: '주역·육효·매화역수와 윷·지오맨시까지, 지금 이 순간의 괘로 고민을 구조화.', items: [
      { id: 'iching', name: '주역', han: '周易', glyph: 'svg:hexagram', grad: 1, blurb: '질문을 여섯 층의 상태와 변화로 나누어 읽습니다. 동전 여섯 번으로 괘를 세웁니다.', grades: { H: 3, R: 3, P: 1, C: 3, X: 2 }, engine: 'iching', fields: [Fq('예) 이 프로젝트를 지금 계속해야 할까, 접어야 할까?')] },
      { id: 'yukhyo', name: '육효', han: '六爻', glyph: '爻', grad: 5, blurb: '괘의 여섯 효에 간지·오행·육친을 배정해 사건을 세밀히 봅니다.', grades: { H: 3, R: 3, P: 1, C: 2, X: 2 }, engine: 'iching', mode: 'yukhyo', fields: [Fq('예) 잃어버린 물건을 찾을 수 있을까?')] },
      { id: 'plum', name: '매화역수', han: '梅花易數', glyph: 'svg:blossom', grad: 10, blurb: '수와 시간으로 괘를 세우고, 체(나)와 용(환경)의 생극으로 흐름을 봅니다.', grades: { H: 2, R: 3, P: 0, C: 2, X: 2 }, engine: 'plum', fields: [Fq('예) 지금 이 결정의 타이밍이 맞을까?'), { type: 'seg', key: 'mode', label: '괘 세우는 법', options: [['time', '지금 시각으로'], ['num', '직접 두 수']], default: 'time' }, { type: 'number', key: 'n1', label: '첫째 수(상괘)', showIf: ['mode', 'num'], placeholder: '1~99' }, { type: 'number', key: 'n2', label: '둘째 수(하괘)', showIf: ['mode', 'num'], placeholder: '1~99' }] },
      { id: 'yut', name: '윷점', han: '柶占', glyph: '柶', grad: 2, blurb: '윷 네 가락을 던져 나온 괘로 새해·고민의 길흉을 봅니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'iching', mode: 'yut', fields: [Fq('예) 올해 내 운세의 큰 흐름은?')] },
      { id: 'geomancy', name: '지오맨시', han: 'Geomancy', glyph: '⚏', grad: 22, blurb: '점을 찍어 16형상을 만들고 실드(방패)로 판결 figure를 얻습니다.', grades: { H: 3, R: 3, P: 0, C: 2, X: 2 }, engine: 'geomancy', fields: [Fq('예) 이 제안을 받아들여도 될까?')] },
      { id: 'coin-toss', name: '주역 척전', han: '擲錢', glyph: '圓', grad: 14, blurb: '동전을 던져 세우는 가장 대중적인 주역점. 빠른 한 괘의 조언.', grades: { H: 3, R: 3, P: 1, C: 3, X: 2 }, engine: 'iching', fields: [Fq('예) 지금 가장 궁금한 한 가지는?')] }
    ]},

    { key: 'india', label: '인도·티베트·베다', desc: '항성황도와 나크샤트라·다샤로 읽는 인도 점성, 그리고 티베트 전통.', items: [
      { id: 'vedic', name: '조티샤 출생점성', han: 'Jyotiṣa', glyph: '🕉', grad: 3, blurb: '달의 항성 위치로 나크샤트라·라시·다샤 흐름을 읽는 인도 점성.', grades: { H: 3, R: 2, P: 0, C: 2, X: 2 }, engine: 'vedic', fields: [Fb, Ft, Fz, Fq()] },
      { id: 'nakshatra', name: '나크샤트라', han: 'Nakṣatra', glyph: '✧', grad: 6, blurb: '달이 머문 27 별자리로 보는 타고난 성향(출생 별).', grades: { H: 3, R: 2, P: 0, C: 2, X: 1 }, engine: 'vedic', mode: 'nak', fields: [Fb, Ft, Fz] },
      { id: 'dasha', name: '빔쇼타리 다샤', han: 'Daśā', glyph: '時', grad: 13, blurb: '행성이 시간의 주도권을 갖는 120년 주기. 지금은 누구의 시기인가.', grades: { H: 3, R: 2, P: 0, C: 2, X: 2 }, engine: 'vedic', mode: 'dasha', fields: [Fb, Ft, Fz, Fq('예) 지금 시기에 큰 변화를 시도해도 될까?')] },
      { id: 'tibetan', name: '티베트 점성', han: 'nag rtsis', glyph: '☸', grad: 24, blurb: '오행·동물·구궁을 결합한 티베트 전통. 생명력·운세의 흐름 설계.', grades: { H: 3, R: 1, P: 0, C: 1, X: 2 }, engine: 'consult', fields: [Fq('예) 올해 내 기운(룽타)을 어떻게 북돋울까?')],
        framework: fw('티베트 점성은 생명력(srog)·신체(lus)·운(rlung rta)의 균형을 봅니다. 당신의 상태를 네 축으로 점검합니다.', [
          { title: '생명력', prompt: '최근 잠·호흡·활력이 어떤가요? 가장 먼저 회복할 하나는?' },
          { title: '마음(바람)', prompt: '생각이 과하게 흩날리나요(룽)? 고요를 되찾을 루틴 하나는?' },
          { title: '운(룽타)', prompt: '요즘 "흐름을 타는" 느낌의 일과 "거스르는" 느낌의 일을 구분해 보세요.' }
        ], '이는 의학적 진단이 아닙니다. 지속되는 신체·정신 증상은 전문가와 상의하세요.') },
      { id: 'vastu', name: '바스투', han: 'Vāstu', glyph: '卍', grad: 8, blurb: '인도 전통 공간학. 방위와 배치로 삶의 기운을 조율하는 설계.', grades: { H: 3, R: 1, P: 0, C: 2, X: 1 }, engine: 'guided', spec: 'PUNGSU', fields: [quiz('PUNGSU')] }
    ]},

    { key: 'western', label: '서양 점성', desc: '태양·달·상승점과 호라리·행성시까지, 하늘의 좌표로 읽는 서양 전통.', items: [
      { id: 'western', name: '태양 별자리', han: 'Sun Sign', glyph: 'svg:sun', grad: 8, blurb: '태어난 순간 태양의 황도 위치로 별자리·원소·양식의 기본 성향을 봅니다.', grades: { H: 3, R: 3, P: 1, C: 2, X: 2 }, engine: 'western', fields: [Fb, Ft, Fz, Fq()] },
      { id: 'moonsign', name: '달 별자리', han: 'Moon Sign', glyph: 'svg:moon', grad: 18, blurb: '감정·습관·내면을 상징하는 달의 별자리. 마음의 기본 리듬.', grades: { H: 3, R: 2, P: 0, C: 2, X: 1 }, engine: 'moonsign', fields: [Fb, Ft, Fz] },
      { id: 'ascendant', name: '상승점(어센던트)', han: 'Ascendant', glyph: '↑', grad: 11, blurb: '세상에 드러나는 첫인상과 삶의 무대. 태어난 시각이 필요합니다.', grades: { H: 3, R: 2, P: 0, C: 2, X: 1 }, engine: 'ascendant', fields: [Fb, Ft, Fz] },
      { id: 'horary', name: '호라리', han: 'Horary', glyph: '?', grad: 1, blurb: '질문한 순간의 하늘로 구체적 사건의 가부를 보는 점성. 질문 설계 상담.', grades: { H: 3, R: 2, P: 0, C: 2, X: 2 }, engine: 'consult', fields: [Fq('예) 제안받은 그 자리를 수락하는 게 맞을까?'), { type: 'seg', key: 'focus', label: '질문 유형', options: [['결정', '할까/말까'], ['분실', '찾을까'], ['관계', '이어질까'], ['시기', '언제쯤']], default: '결정' }],
        framework: fw('호라리는 "진지하게 형성된 질문"에만 답합니다. 당신의 질문을 호라리 판독 순서로 구조화합니다.', [
          { title: '질문자(1하우스)', prompt: '당신은 지금 이 일을 실행할 정보와 힘을 갖고 있나요?' },
          { title: '대상(질문 하우스)', prompt: '묻는 대상이 지금 어떤 상태인가요? 가까워지고 있나요, 멀어지고 있나요?' },
          { title: '방해·전달', prompt: '둘 사이를 막거나 이어 주는 제3의 요인(사람·조건)은 무엇인가요?' }
        ], '같은 질문을 유리한 답이 나올 때까지 반복해 묻지 마세요. 조건이 바뀔 때만 다시 묻습니다.') },
      { id: 'planetaryHours', name: '행성시', han: 'Planetary Hours', glyph: '🪐', grad: 21, blurb: '요일·시각의 지배행성으로 지금 하기 좋은 일을 봅니다.', grades: { H: 3, R: 3, P: 0, C: 2, X: 1 }, engine: 'planetaryHours', fields: [FdateOpt] },
      { id: 'solarterm', name: '24절기', han: '節氣', glyph: '🌿', grad: 23, blurb: '지금의 절기와 다음 절기까지. 자연의 리듬에 맞춘 삶의 전환점.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'solarterm', fields: [FdateOpt] },
      { id: 'compat-western', name: '별자리 궁합', han: 'Synastry', glyph: '♥', grad: 9, blurb: '두 사람 태양 별자리의 원소 조합으로 보는 궁합.', grades: { H: 3, R: 3, P: 0, C: 2, X: 1 }, engine: 'relationship', method: 'western', fields: [Fb, Fb2] }
    ]},

    { key: 'cards', label: '카드·상징점', desc: '타로·룬·르노르망·오검·이파와 주사위·진자까지, 상징을 뽑아 읽는 체험.', items: [
      { id: 'tarot', name: '타로 3장', han: 'Tarot', glyph: 'svg:tarot', grad: 0, blurb: '78장에서 상황·장애·조언 세 장을 뽑아 현재 선택을 구조화합니다.', grades: { H: 2, R: 2, P: 0, C: 3, X: 2 }, engine: 'draw', deck: 'tarot', count: 3, reversals: true, positions: ['현재 상황', '핵심 장애', '권장 행동'], fields: [draw('예) 지금 이 관계를 어떻게 풀어가야 할까?')] },
      { id: 'tarot-celtic', name: '타로 켈틱크로스', han: 'Celtic Cross', glyph: '✚', grad: 12, blurb: '10장으로 과거·현재·미래와 희망·결과까지 깊이 읽는 정통 배열.', grades: { H: 2, R: 2, P: 0, C: 3, X: 2 }, engine: 'draw', deck: 'tarot', count: 10, reversals: true, positions: ['현재', '장애/교차', '뿌리(과거)', '최근 과거', '목표/가능성', '가까운 미래', '나의 태도', '주변 환경', '희망과 두려움', '최종 경향'], fields: [draw('예) 이 일의 전체 그림과 결말이 궁금하다')] },
      { id: 'tarot-love', name: '타로 관계 배열', han: 'Love Spread', glyph: '♡', grad: 10, blurb: '나·상대·관계의 흐름을 다섯 장으로 읽는 관계 전용 배열.', grades: { H: 2, R: 2, P: 0, C: 3, X: 2 }, engine: 'draw', deck: 'tarot', count: 5, reversals: true, positions: ['나', '상대', '관계의 현재', '장애', '조언·전개'], fields: [draw('예) 우리 관계는 앞으로 어떻게 흘러갈까?')] },
      { id: 'tarot-yesno', name: '타로 예/아니오', han: 'Yes/No', glyph: '✔', grad: 18, blurb: '한 장으로 빠르게 방향을 잡는 간단 배열.', grades: { H: 2, R: 2, P: 0, C: 2, X: 2 }, engine: 'draw', deck: 'tarot', count: 1, reversals: true, positions: ['지금의 핵심'], fields: [draw('예) 지금 이 선택, 밀어붙여도 될까?')] },
      { id: 'tarot-day', name: '오늘의 타로', han: 'Daily', glyph: '☀', grad: 8, blurb: '오늘 하루의 기운과 집중할 한 가지를 한 장으로.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'tarot', count: 1, reversals: true, positions: ['오늘의 메시지'], fields: [draw('예) 오늘 내가 가장 신경 써야 할 것은?')] },
      { id: 'lenormand', name: '르노르망 3장', han: 'Lenormand', glyph: '🍀', grad: 3, blurb: '36장을 조합해 하나의 문장처럼 흐름을 읽는 근세 유럽 카드.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'lenormand', count: 3, reversals: false, positions: ['지금', '전개', '결과 경향'], fields: [draw('예) 이직 과정이 어떻게 풀릴까?')] },
      { id: 'lenormand-5', name: '르노르망 5장', han: 'Lenormand 5', glyph: '🚢', grad: 11, blurb: '배경·현재·변수·방향·결과를 다섯 장으로 확장해 읽습니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'lenormand', count: 5, reversals: false, positions: ['배경', '지금', '숨은 변수', '권장 방향', '결과 경향'], fields: [draw()] },
      { id: 'runes', name: '룬 3룬', han: 'Runes', glyph: 'svg:rune', grad: 17, blurb: '엘더 푸사르크 24룬을 뽑아 배경·현재·전개를 읽습니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 2 }, engine: 'draw', deck: 'runes', count: 3, reversals: true, canReverseKey: 'canReverse', positions: ['배경(지나온 것)', '현재 핵심', '조건부 전개'], fields: [draw('예) 지금 내게 필요한 조언은?')] },
      { id: 'rune-one', name: '룬 하나', han: 'One Rune', glyph: 'ᚱ', grad: 24, blurb: '오늘, 또는 이 질문에 대한 한 룬의 신탁.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'runes', count: 1, reversals: true, canReverseKey: 'canReverse', positions: ['지금 집중할 것'], fields: [draw()] },
      { id: 'ogham', name: '오검', han: 'Ogham', glyph: 'ᚔ', grad: 18, blurb: '켈트 나무 문자 20개를 뽑아 자연의 지혜로 읽습니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'ogham', count: 3, reversals: false, positions: ['뿌리', '현재', '피어날 것'], fields: [draw()] },
      { id: 'ifa', name: '요루바 이파', han: 'Ifá', glyph: '🌍', grad: 19, blurb: '서아프리카 신탁. 16 오두(Odù) 중 하나를 얻어 삶의 길을 읽습니다.', grades: { H: 3, R: 2, P: 0, C: 2, X: 2 }, engine: 'draw', deck: 'ifa', count: 1, reversals: false, positions: ['지금의 오두'], fields: [draw('예) 지금 내 삶이 가야 할 방향은?')] },
      { id: 'playing', name: '카토맨시', han: 'Cartomancy', glyph: '♠', grad: 5, blurb: '일반 트럼프 52장으로 보는 생활 밀착형 카드점.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'playing', count: 3, reversals: false, positions: ['과거', '현재', '미래 경향'], fields: [draw()] },
      { id: 'oracle-card', name: '오라클 카드', han: 'Oracle', glyph: '🌟', grad: 25, blurb: '성찰과 격려의 메시지를 전하는 긍정 카드 한 장.', grades: { H: 1, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'oracle', count: 1, reversals: false, positions: ['오늘의 메시지'], fields: [draw()] },
      { id: 'dice', name: '주사위점', han: 'Astragalomancy', glyph: 'svg:dice', grad: 15, blurb: '두 주사위를 굴려 나온 수로 질문의 길흉을 봅니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'dice', fields: [draw('예) 지금 이 일을 추진해도 될까?')] },
      { id: 'pendulum', name: '진자 다우징', han: 'Pendulum', glyph: '◉', grad: 13, blurb: '예/아니오로 좁힌 질문에 대한 빠른 직관 신탁.', grades: { H: 2, R: 1, P: 0, C: 2, X: 2 }, engine: 'pendulum', set: 'pendulum', fields: [draw('예/아니오로 답할 수 있는 한 문장으로')] },
      { id: 'mo', name: '티베트 모점', han: 'Mo', glyph: '☷', grad: 6, blurb: '주사위로 문수보살의 지혜를 구하는 불교 전통의 질문점.', grades: { H: 2, R: 2, P: 0, C: 1, X: 2 }, engine: 'pendulum', set: 'mo', fields: [draw('예) 이 길을 가도 좋을지 여쭙니다')] }
    ]},

    { key: 'number', label: '수리·성명·상(相)', desc: '수와 문자, 얼굴과 손금으로 읽는 서양·동양의 상징 체계.', items: [
      { id: 'numerology', name: '수비학', han: 'Numerology', glyph: '7', grad: 4, blurb: '생년월일의 수를 환원해 생명경로수와 올해의 개인해수를 봅니다.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'numerology', fields: [Fb] },
      { id: 'namenum', name: '네임 수비학', han: 'Name Numerology', glyph: 'A', grad: 11, blurb: '영문 이름으로 표현수·영혼수·인격수를 산출합니다.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'nameNum', fields: [FnameEn] },
      { id: 'gematria', name: '게마트리아', han: 'Gematria', glyph: 'Σ', grad: 20, blurb: '문자에 수를 대응시켜 이름·단어의 숨은 수를 읽는 전통.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'nameNum', mode: 'gematria', fields: [FnameEn] },
      { id: 'compat-num', name: '수비학 궁합', han: 'Number Match', glyph: '∞', grad: 9, blurb: '두 사람의 생명경로수로 보는 삶의 리듬 궁합.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'relationship', method: 'numerology', fields: [Fb, Fb2] },
      { id: 'gwansang', name: '관상', han: '觀相', glyph: '👤', grad: 2, blurb: '이마·눈·코·입·턱의 생김으로 읽는 기질. 자가 선택형.', grades: { H: 2, R: 2, P: 0, C: 1, X: 3 }, engine: 'guided', spec: 'GWANSANG', fields: [quiz('GWANSANG')] },
      { id: 'susang', name: '수상(손금)', han: '手相', glyph: 'svg:hand', grad: 10, blurb: '손 모양과 생명선·감정선·두뇌선·운명선으로 읽습니다. 자가 관찰형.', grades: { H: 2, R: 2, P: 0, C: 1, X: 2 }, engine: 'guided', spec: 'SUSANG', fields: [quiz('SUSANG')] }
    ]},

    { key: 'world', label: '세계·토착', desc: '마야 달력, 켈트 나무, 아메리카 토템과 세계 각지의 전통 지혜.', items: [
      { id: 'mayan', name: '마야 쫄킨', han: 'Tzolkʼin', glyph: '🌞', grad: 22, blurb: '260일 신성력의 날 상징(나왈)과 음조로 보는 타고난 에너지.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'mayan', fields: [Fb] },
      { id: 'celtic', name: '켈트 나무점성', han: 'Celtic Tree', glyph: 'svg:leaf', grad: 3, blurb: '드루이드 전통의 나무 상징으로 보는 생일의 기질.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'celtic', fields: [Fb] },
      { id: 'native', name: '네이티브 토템', han: 'Totem', glyph: '🦅', grad: 23, blurb: '아메리카 원주민 전통의 탄생 동물 토템과 기질.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'native', fields: [Fb] },
      { id: 'thaiday', name: '요일점', han: 'Day Oracle', glyph: '📅', grad: 15, blurb: '태어난 요일의 색과 행성으로 보는 성향(태국·동양 공통).', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'thaiday', fields: [Fb] },
      { id: 'greek', name: '그리스 신탁', han: 'Delphic', glyph: '🏛', grad: 24, blurb: '델포이의 격언(그노티 세아우톤 등)으로 받는 고대의 지혜.', grades: { H: 3, R: 1, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'oracle', count: 1, reversals: false, positions: ['신탁의 말'], fields: [draw('예) 지금 내가 들어야 할 조언은?')] },
      { id: 'cowrie', name: '조개점', han: 'Cowrie', glyph: 'svg:shell', grad: 19, blurb: '서아프리카·디아스포라 전통의 조개껍질 신탁.', grades: { H: 3, R: 2, P: 0, C: 2, X: 2 }, engine: 'dice', mode: 'cowrie', fields: [draw('예) 지금 이 문제의 답을 구합니다')] }
    ]},

    { key: 'modern', label: '현대·심리·검증', desc: '기준율·베이즈·시나리오 등 적중을 측정하는 현대 예측과 심리 유형·생체리듬.', items: [
      { id: 'foresight', name: '현대 미래예측', han: 'Foresight', glyph: 'svg:fork', grad: 26, blurb: '기준율에서 출발해 신호로 확률을 갱신하고 4대 미래 시나리오로 준비합니다.', grades: { H: 1, R: 3, P: 2, C: 3, X: 1 }, engine: 'foresight', fields: [
        { type: 'textarea', key: 'event', label: '① 사건 — 무엇이 일어나면 "발생"인가', placeholder: '예) 3개월 연속 월 매출 500만원 이상' },
        { type: 'text', key: 'horizon', label: '② 기간 — 언제까지', placeholder: '예) 2027년 6월 30일까지' },
        { type: 'range', key: 'base', label: '③ 기준율 — 비슷한 사례의 과거 성공률(%)', min: 1, max: 99, default: 30, hint: '자료가 없으면 느낌이 아니라 "모름(30% 부근)"에서 시작하세요.' },
        { type: 'signals', key: 'signals', label: '④ 신호 — 확률을 올리거나 내리는 증거' },
        { type: 'seg', key: 'controllability', label: '⑤ 통제 가능성', options: [['low', '낮음'], ['mid', '보통'], ['high', '높음']], default: 'mid' }] },
      { id: 'baserate', name: '기준율 계산기', han: 'Base Rate', glyph: 'svg:chart', grad: 16, blurb: '모든 예측의 출발점. "비슷한 사례는 보통 얼마나?"를 먼저 잡습니다.', grades: { H: 1, R: 3, P: 2, C: 3, X: 1 }, engine: 'foresight', mode: 'baserate', fields: [
        { type: 'textarea', key: 'event', label: '사건 — 무엇의 발생률인가', placeholder: '예) 신규 식당이 2년 내 생존' },
        { type: 'range', key: 'base', label: '내가 아는 기준율(%)', min: 1, max: 99, default: 30 },
        { type: 'seg', key: 'controllability', label: '통제 가능성', options: [['low', '낮음'], ['mid', '보통'], ['high', '높음']], default: 'mid' }] },
      { id: 'montecarlo', name: '몬테카를로', han: 'Monte Carlo', glyph: '🎲', grad: 21, blurb: '최소·예상·최대를 넣으면 수천 번 시뮬레이션해 확률 분포를 봅니다.', grades: { H: 1, R: 3, P: 2, C: 2, X: 1 }, engine: 'montecarlo', fields: [
        { type: 'text', key: 'label', label: '무엇을 추정하나', placeholder: '예) 내년 월 평균 매출(만원)' },
        { type: 'number', key: 'min', label: '최소(비관)', placeholder: '예) 200' },
        { type: 'number', key: 'mode', label: '예상(최빈)', placeholder: '예) 500' },
        { type: 'number', key: 'max', label: '최대(낙관)', placeholder: '예) 1200' },
        { type: 'number', key: 'target', label: '목표치(이상이면 성공)', placeholder: '예) 600' }] },
      { id: 'scenario', name: '시나리오 2×2', han: 'Scenarios', glyph: '▦', grad: 1, blurb: '두 핵심 불확실성을 축으로 네 가지 미래를 그려 대비합니다.', grades: { H: 1, R: 2, P: 1, C: 3, X: 1 }, engine: 'consult', fields: [Fq('예) 우리 사업의 3년 후가 궁금하다'), { type: 'text', key: 'axis1', label: '축 1 — 가장 큰 불확실성', placeholder: '예) 시장 수요(높음↔낮음)' }, { type: 'text', key: 'axis2', label: '축 2 — 두 번째 불확실성', placeholder: '예) 규제(완화↔강화)' }],
        framework: fw('시나리오 플래닝은 "하나의 미래를 맞히기"가 아니라 "여러 미래에 모두 대비하기"입니다. 두 축이 만든 네 사분면을 설계합니다.', [
          { title: '네 미래 그리기', prompt: '두 축의 조합으로 생긴 네 세계 각각에, 당신이 할 수 있는 최선의 한 수를 미리 적어 두세요.' },
          { title: '공통 대비(no-regret)', prompt: '네 미래 어디서도 후회하지 않을 행동 하나는 무엇인가요? 그것부터 지금 하세요.' },
          { title: '조기신호', prompt: '어느 미래로 가는지 알려 줄 가장 빠른 신호 한 가지는?' }
        ], '시나리오는 예측이 아니라 준비입니다. 분기마다 신호를 점검해 어느 미래에 가까운지 갱신하세요.') },
      { id: 'delphi', name: '집단예측(델파이)', han: 'Delphi', glyph: '👥', grad: 11, blurb: '여러 사람의 독립적 판단을 모아 더 정확한 예측으로 수렴시키는 법.', grades: { H: 1, R: 2, P: 2, C: 2, X: 1 }, engine: 'consult', fields: [Fq('예) 이 신제품이 성공할지 팀의 판단을 모으고 싶다')],
        framework: fw('집단예측은 "독립적 판단"을 모을 때 가장 강해집니다(쏠림을 막는 것이 핵심).', [
          { title: '독립 수집', prompt: '서로 상의하기 전에 각자 확률·근거를 익명으로 적게 했나요?' },
          { title: '이유 공유', prompt: '숫자만이 아니라 "왜 그렇게 봤는지"를 익명으로 돌려 보세요.' },
          { title: '2차 수렴', prompt: '남의 근거를 본 뒤 각자 다시 추정하게 하고, 중앙값을 쓰세요(평균보다 극단에 강함).' }
        ], '한 사람의 목소리가 크면 집단지성이 무너집니다. 익명성과 독립성을 지키세요.') },
      { id: 'premortem', name: '프리모템', han: 'Pre-mortem', glyph: '⚰', grad: 27, blurb: '"이미 실패했다"고 가정하고 원인을 거꾸로 찾아 미리 막는 기법.', grades: { H: 1, R: 2, P: 2, C: 3, X: 1 }, engine: 'consult', fields: [Fq('예) 이 프로젝트가 꼭 성공했으면 한다')],
        framework: fw('프리모템은 낙관 편향을 깨는 가장 강력한 도구입니다. 미래로 가서 실패를 먼저 목격합니다.', [
          { title: '실패 선언', prompt: '1년 뒤 이 일이 완전히 실패했습니다. 가장 그럴듯한 사망 원인 3가지를 적어 보세요.' },
          { title: '가장 치명적 하나', prompt: '그 중 지금 손쓰지 않으면 가장 위험한 하나는?' },
          { title: '선제 조치', prompt: '그 하나를 막기 위해 이번 주에 할 수 있는 작은 행동은?' }
        ], '비관은 목적이 아니라 예방입니다. 찾은 위험마다 "완화책"을 꼭 하나씩 붙이세요.') },
      { id: 'mbti', name: '기질 유형', han: 'Type', glyph: '🧭', grad: 18, blurb: '16가지 성격 유형으로 보는 에너지·인식·판단·생활 방식.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'guided', spec: 'MBTI', fields: [quiz('MBTI')] },
      { id: 'ennea', name: '에니어그램', han: 'Enneagram', glyph: '9', grad: 13, blurb: '아홉 유형으로 보는 핵심 동기와 두려움, 성장의 방향.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'guided', spec: 'ENNEA', fields: [quiz('ENNEA')] },
      { id: 'biorhythm', name: '생체리듬', han: 'Biorhythm', glyph: 'svg:wave', grad: 14, blurb: '신체·감성·지성 세 주기. 주기는 정확하나 성과 예측력은 미검증입니다.', grades: { H: 1, R: 3, P: 0, C: 1, X: 1 }, engine: 'biorhythm', fields: [Fb, Ftarget] },
      { id: 'bloodtype', name: '혈액형 성격', han: 'Blood Type', glyph: '🩸', grad: 5, blurb: '대중 심리 속 혈액형 성향(과학적 근거는 약합니다).', grades: { H: 1, R: 3, P: 0, C: 1, X: 2 }, engine: 'bloodtype', fields: [{ type: 'seg', key: 'blood', label: '혈액형', options: [['A', 'A형'], ['B', 'B형'], ['O', 'O형'], ['AB', 'AB형']], default: 'A' }] },
      { id: 'dream', name: '꿈해몽', han: '解夢', glyph: '💤', grad: 17, blurb: '꿈 속 상징을 전통 해몽과 심리적 관점으로 함께 풀이합니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'dream', fields: [{ type: 'textarea', key: 'q', label: '꿈 내용을 적어 주세요', placeholder: '예) 맑은 물에서 큰 물고기를 잡는 꿈을 꿨다', hint: '물·불·뱀·돈·이빨 등 상징 단어가 들어가면 더 잘 풀립니다.' }] }
    ]}
  ];

  // ── 추가 체계 (100+ 달성; 공용 렌더러 재사용) ──────────────
  function catOf(k) { for (var i = 0; i < CATS.length; i++) if (CATS[i].key === k) return CATS[i]; }
  var EXTRA = [
    // 동아시아
    ['east', { id: 'ttiunse', name: '띠별 올해 운세', han: '歲運', glyph: '🧧', grad: 9, blurb: '내 띠와 올해 태세의 관계(삼합·육합·충)로 보는 한 해 운세.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'zodiac', mode: 'year', fields: [Fb] }],
    ['east', { id: 'sijin', name: '십이시 지금', han: '十二時', glyph: '🕐', grad: 14, blurb: '지금 이 시각의 십이지 동물과 기운을 봅니다.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'sijin', fields: [] }],
    ['east', { id: 'jakmyeong', name: '작명 길한 수', han: '作名', glyph: '筆', grad: 20, blurb: '성(姓)에 어울리는 길한 획수 조합을 추천합니다.', grades: { H: 2, R: 2, P: 0, C: 1, X: 1 }, engine: 'jakmyeong', fields: [{ type: 'text', key: 'sur', label: '성(姓) 한 글자', placeholder: '예) 김' }] }],
    // 역·괘점
    ['oracle', { id: 'harak', name: '하락이수', han: '河洛理數', glyph: '洛', grad: 1, blurb: '하도·낙서의 수리로 괘를 세워 보는 수리 역학.', grades: { H: 2, R: 3, P: 0, C: 2, X: 2 }, engine: 'iching', mode: 'harak', fields: [Fq('예) 올해 나의 큰 흐름은?')] }],
    ['oracle', { id: 'jecheop', name: '제비뽑기 신탁', han: '籤', glyph: '签', grad: 25, blurb: '한 장의 제비로 받는 간결한 오늘의 길잡이.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'oracle', count: 1, reversals: false, positions: ['뽑은 제비'], fields: [draw()] }],
    // 인도·티베트
    ['india', { id: 'prashna', name: '프라슈나', han: 'Praśna', glyph: '❓', grad: 3, blurb: '질문한 순간을 기준으로 답을 구하는 인도식 질문점. 질문 설계 상담.', grades: { H: 3, R: 1, P: 0, C: 2, X: 2 }, engine: 'consult', fields: [Fq('예) 지금 이 일이 이루어질까?')],
      framework: fw('프라슈나는 "질문이 진지하게 형성된 순간"을 봅니다. 당신의 물음을 세 겹으로 구조화합니다.', [{ title: '질문자의 힘', prompt: '당신은 이 일을 실제로 추진할 준비·자원이 되어 있나요?' }, { title: '대상의 상태', prompt: '묻는 대상은 지금 다가오고 있나요, 멀어지고 있나요?' }, { title: '달(마음)', prompt: '요즘 당신의 마음은 이 일에 집중돼 있나요, 흩어져 있나요?' }], '같은 질문을 반복해 유리한 답만 고르지 마세요.') }],
    ['india', { id: 'muhurta', name: '무후르타', han: 'Muhūrta', glyph: '🔔', grad: 15, blurb: '행동을 시작할 좋은 때를 고르는 인도식 택일.', grades: { H: 3, R: 3, P: 0, C: 2, X: 1 }, engine: 'iljin', mode: 'muhurta', fields: [FdateOpt, Fq('예) 이 날 중요한 일을 시작해도 될까?')] }],
    ['india', { id: 'dosha', name: '아유르베다 도샤', han: 'Doṣa', glyph: '🌿', grad: 24, blurb: '바타·피타·카파 세 체질로 보는 몸과 마음의 균형. 자가 설문형.', grades: { H: 3, R: 2, P: 0, C: 2, X: 1 }, engine: 'guided', spec: 'DOSHA', fields: [quiz('DOSHA')] }],
    ['india', { id: 'nadi', name: '나디 점성', han: 'Nāḍi', glyph: '📜', grad: 13, blurb: '남인도 필사본 전통. 운명의 흐름(맥)을 읽는 설계 상담.', grades: { H: 2, R: 1, P: 0, C: 1, X: 3 }, engine: 'consult', fields: [Fq('예) 내 삶의 큰 방향과 과제는?')],
      framework: fw('나디는 "이미 정해진 운명"처럼 말하기 쉬워 주의가 필요합니다. 여기서는 당신 삶의 반복 패턴을 성찰합니다.', [{ title: '반복되는 패턴', prompt: '관계·일에서 비슷하게 반복되는 상황이 있나요? 그 패턴의 공통점은?' }, { title: '물려받은 과제', prompt: '가족·환경에서 물려받아 지금도 씨름하는 주제가 있나요?' }, { title: '전환의 열쇠', prompt: '그 패턴을 끊기 위해 바꿀 수 있는 작은 습관 하나는?' }], '"운명이 적혀 있다"는 단정은 의존·정보유출 위험을 키웁니다. 참고로만 받아들이세요.') }],
    // 서양 점성
    ['western', { id: 'decan', name: '데칸(10도)', han: 'Decan', glyph: '♒', grad: 11, blurb: '별자리를 10도씩 셋으로 나눈 세부 성향(데칸).', grades: { H: 3, R: 2, P: 0, C: 1, X: 1 }, engine: 'western', mode: 'decan', fields: [Fb, Ft, Fz] }],
    ['western', { id: 'ztoday', name: '별자리 오늘의 운세', han: 'Daily Horoscope', glyph: '🔮', grad: 1, blurb: '내 태양 별자리로 보는 오늘의 흐름과 조언.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'western', mode: 'today', fields: [Fb, Fz] }],
    ['western', { id: 'solar-return', name: '솔라리턴(생일점)', han: 'Solar Return', glyph: '🎂', grad: 8, blurb: '태양이 출생 위치로 돌아오는 한 해의 주제를 설계합니다.', grades: { H: 3, R: 1, P: 0, C: 2, X: 1 }, engine: 'consult', fields: [Fq('예) 다음 생일부터 1년, 나는 무엇에 집중해야 할까?')],
      framework: fw('솔라리턴은 "생일부터 1년"을 한 챕터로 봅니다. 올해의 주제를 설계합니다.', [{ title: '지난 1년 결산', prompt: '지난 생일 이후 가장 크게 배운 것과 가장 아쉬운 것은?' }, { title: '올해의 한 단어', prompt: '다음 1년을 한 단어로 정한다면? 그 단어에 맞는 행동 하나는?' }, { title: '버릴 것', prompt: '새 챕터를 위해 내려놓을 습관·관계·일 하나는?' }], '1년 주제는 방향일 뿐, 매 분기 현실에 맞춰 조정하세요.') }],
    // 카드·상징
    ['cards', { id: 'tarot-year', name: '타로 연간 12장', han: 'Year Ahead', glyph: '🗓', grad: 12, blurb: '열두 달 각각에 한 장씩, 한 해의 월별 흐름을 읽습니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 2 }, engine: 'draw', deck: 'tarot', count: 12, reversals: true, positions: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'], fields: [draw('예) 올 한 해 월별 흐름이 궁금하다')] }],
    ['cards', { id: 'lenormand-grand', name: '르노르망 그랜드', han: 'Grand Tableau', glyph: '🏰', grad: 11, blurb: '아홉 장으로 삶의 여러 영역을 한눈에 조망합니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'draw', deck: 'lenormand', count: 9, reversals: false, positions: ['핵심', '과거', '미래', '마음', '외부', '장애', '조력', '재물', '결과'], fields: [draw()] }],
    ['cards', { id: 'norse-cast', name: '룬 캐스팅 5', han: 'Rune Cast', glyph: 'ᛉ', grad: 17, blurb: '다섯 룬으로 상황의 여러 면을 입체적으로 읽습니다.', grades: { H: 2, R: 2, P: 0, C: 2, X: 2 }, engine: 'draw', deck: 'runes', count: 5, reversals: true, canReverseKey: 'canReverse', positions: ['핵심', '장애', '조력', '해야 할 일', '결과 경향'], fields: [draw()] }],
    ['cards', { id: 'domino', name: '도미노점', han: '骨牌', glyph: '🁣', grad: 5, blurb: '도미노(골패)의 두 수로 보는 빠른 길흉.', grades: { H: 2, R: 2, P: 0, C: 1, X: 1 }, engine: 'dice', mode: 'domino', fields: [draw()] }],
    // 수리·성명
    ['number', { id: 'birthday-num', name: '생일수', han: 'Birth Day', glyph: '①', grad: 4, blurb: '태어난 "날"의 수로 보는 타고난 재능 포인트.', grades: { H: 2, R: 3, P: 0, C: 1, X: 1 }, engine: 'numerology', mode: 'bday', fields: [Fb] }],
    ['number', { id: 'kabbalah', name: '카발라 생명나무', han: 'Kabbalah', glyph: '✡', grad: 20, blurb: '세피로트의 열 가지 길로 지금의 과제를 성찰합니다.', grades: { H: 3, R: 1, P: 0, C: 2, X: 1 }, engine: 'consult', fields: [Fq('예) 지금 내 성장의 과제는 무엇일까?')],
      framework: fw('카발라의 생명나무는 "균형"의 지도입니다. 지금 당신에게 부족하거나 넘치는 축을 봅니다.', [{ title: '자비 ↔ 엄격', prompt: '요즘 너무 물러서 손해 보나요, 너무 엄격해 관계를 잃나요? 어느 쪽을 보완할까요?' }, { title: '지혜 ↔ 이해', prompt: '큰 비전은 있는데 구체화가 약한가요, 디테일에 갇혀 큰 그림을 잃었나요?' }, { title: '기반(Yesod)', prompt: '상상과 현실 사이, 지금 땅에 내릴 구체적 한 걸음은?' }], '상징 체계는 성찰의 거울입니다. 결론을 단정하지 말고 질문으로 쓰세요.') }],
    // 세계·토착
    ['world', { id: 'aztec', name: '아즈텍 토날포왈리', han: 'Tōnalpōhualli', glyph: '🌅', grad: 22, blurb: '아즈텍 260일 달력의 날 상징으로 보는 타고난 기운.', grades: { H: 3, R: 3, P: 0, C: 1, X: 1 }, engine: 'mayan', mode: 'aztec', fields: [Fb] }],
    ['world', { id: 'lunar28', name: '28수 별자리', han: '二十八宿', glyph: '🌙', grad: 18, blurb: '달이 지나는 28개 별자리(수)로 보는 동양 천문의 기운.', grades: { H: 3, R: 1, P: 0, C: 1, X: 1 }, engine: 'consult', fields: [Fq('예) 지금 나의 기운은 어느 방향에 있을까?')],
      framework: fw('28수는 하늘을 넷(청룡·백호·주작·현무)으로 나눈 동양 천문 지도입니다. 당신의 지금을 사방위 리듬으로 봅니다.', [{ title: '동(봄·청룡)', prompt: '새로 틔우고 싶은 싹이 있나요?' }, { title: '남(여름·주작)', prompt: '드러내고 펼칠 것이 있나요?' }, { title: '서·북(가을·겨울)', prompt: '거두고 갈무리하며 쉴 것은 무엇인가요?' }], '천문 상징은 계절 리듬의 비유로 쓰되, 구체 사건 예측으로 삼지 마세요.') }],
    // 현대·심리·검증
    ['modern', { id: 'decision-matrix', name: '의사결정 매트릭스', han: 'Decision', glyph: '⚖', grad: 16, blurb: '선택지를 기준별 가중치로 점수화해 합리적으로 고릅니다.', grades: { H: 1, R: 3, P: 1, C: 3, X: 1 }, engine: 'consult', fields: [Fq('예) A와 B 중 무엇을 선택할까?')],
      framework: fw('감이 아니라 "기준×가중치"로 결정합니다. 후회를 줄이는 가장 단순한 도구입니다.', [{ title: '기준 정하기', prompt: '이 결정에서 정말 중요한 기준 3가지와, 각각의 중요도(가중치)를 정하세요.' }, { title: '점수 매기기', prompt: '각 선택지를 기준마다 1~5점으로 매기고, 가중치를 곱해 합산하세요.' }, { title: '직감 점검', prompt: '점수 1위가 마음에 안 든다면, 빠뜨린 기준이 있는 겁니다 — 그것을 추가하세요.' }], '숫자는 생각을 정리하는 도구입니다. 최종 책임은 당신의 가치가 집니다.') }],
    ['modern', { id: 'cross-impact', name: '교차영향 분석', han: 'Cross-Impact', glyph: '🔗', grad: 1, blurb: '여러 사건이 서로 어떻게 영향을 주는지 지도로 그립니다.', grades: { H: 1, R: 2, P: 1, C: 2, X: 1 }, engine: 'consult', fields: [Fq('예) 여러 변수가 얽힌 이 상황을 정리하고 싶다')],
      framework: fw('복잡한 상황은 "무엇이 무엇을 움직이는가"를 그리면 단순해집니다.', [{ title: '핵심 변수 나열', prompt: '이 상황을 좌우하는 변수 4~5개를 적으세요.' }, { title: '영향 화살표', prompt: '어떤 변수가 어떤 변수를 강하게 밀거나 막나요? 화살표로 이으세요.' }, { title: '지렛대', prompt: '가장 많은 화살표가 나가는 변수가 지렛대입니다 — 거기에 자원을 쓰세요.' }], '모든 것을 통제할 순 없습니다. 지렛대 하나에 집중하세요.') }],
    ['modern', { id: 'risk-register', name: '리스크 점검', han: 'Risk Register', glyph: '🛡', grad: 27, blurb: '발생확률×영향으로 위험의 우선순위를 매기고 대비합니다.', grades: { H: 1, R: 3, P: 1, C: 3, X: 1 }, engine: 'consult', fields: [Fq('예) 이 계획에서 미리 대비할 위험은?')],
      framework: fw('위험은 "막연한 걱정"을 "확률×영향"으로 바꿀 때 관리됩니다.', [{ title: '위험 목록', prompt: '이 일에서 잘못될 수 있는 것 5가지를 적으세요.' }, { title: '우선순위', prompt: '각각을 발생확률(상·중·하)×영향(큼·보통·작음)으로 매기세요. "확률 중+영향 큼"이 1순위.' }, { title: '대비책', prompt: '상위 2개에만 구체적 대비책(예방·완화·대응)을 하나씩 붙이세요.' }], '모든 위험을 막을 순 없습니다. 상위 몇 개에 집중하는 것이 현실적입니다.') }],
    ['modern', { id: 'fibonacci', name: '추세·되돌림 점검', han: 'Trend', glyph: '📐', grad: 23, blurb: '추세와 되돌림의 관점으로 타이밍 감각을 점검합니다.', grades: { H: 1, R: 2, P: 1, C: 2, X: 2 }, engine: 'consult', fields: [Fq('예) 지금이 들어갈(또는 나올) 타이밍일까?')],
      framework: fw('타이밍은 "추세의 방향"과 "되돌림(조정)"을 구분할 때 보입니다. 단, 과거 패턴이 미래를 보장하진 않습니다.', [{ title: '추세 확인', prompt: '최근 6개월, 이 흐름은 올라가나요 내려가나요 옆으로 가나요?' }, { title: '되돌림인가 전환인가', prompt: '지금의 하락/상승이 일시 조정인지, 방향 전환인지 구분할 신호는?' }, { title: '손실 한도', prompt: '들어간다면, 어디까지 틀리면 빠져나올지 먼저 정했나요?' }], '차트 패턴·되돌림은 참고 지표일 뿐입니다. 손실 한도 없는 진입은 도박입니다.') }],
    ['modern', { id: 'disc', name: 'DISC 행동유형', han: 'DISC', glyph: '🅳', grad: 11, blurb: '주도·사교·안정·신중 네 가지 행동 성향을 봅니다. 자가 설문형.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'guided', spec: 'DISC', fields: [quiz('DISC')] }],
    ['modern', { id: 'love-language', name: '사랑의 언어', han: 'Love Language', glyph: '💞', grad: 10, blurb: '내가 사랑을 느끼고 표현하는 주된 방식을 봅니다. 자가 설문형.', grades: { H: 2, R: 2, P: 0, C: 2, X: 1 }, engine: 'guided', spec: 'LOVE', fields: [quiz('LOVE')] }],
    ['modern', { id: 'egyptian', name: '이집트 데칸 점성', han: 'Egyptian', glyph: '𓂀', grad: 19, blurb: '고대 이집트의 36 데칸과 신격으로 보는 수호 상징.', grades: { H: 3, R: 1, P: 0, C: 1, X: 1 }, engine: 'consult', fields: [Fq('예) 나를 지키는 기운과 올해의 과제는?')],
      framework: fw('이집트 점성은 하늘을 36 데칸으로 나눴습니다. 여기서는 수호·재생의 상징으로 당신의 지금을 봅니다.', [{ title: '수호(보호)', prompt: '지금 당신을 지켜 주는 사람·습관·자원은 무엇인가요? 더 키울 수 있나요?' }, { title: '재생(나일)', prompt: '한 번 무너졌다 다시 차오른 경험이 있나요? 그 회복의 비결은?' }, { title: '영원(세우는 것)', prompt: '오래 남길 것을 지금 무엇 하나 쌓고 있나요?' }], '고대 상징은 영감의 재료입니다. 구체 사건 예측으로 쓰지 마세요.') }],
    ['cards', { id: 'tarot-career', name: '타로 커리어 배열', han: 'Career', glyph: '💼', grad: 15, blurb: '현재·강점·장애·다음 단계를 네 장으로 읽는 진로 전용 배열.', grades: { H: 2, R: 2, P: 0, C: 3, X: 2 }, engine: 'draw', deck: 'tarot', count: 4, reversals: true, positions: ['현재 위치', '나의 강점', '핵심 장애', '다음 단계'], fields: [draw('예) 내 커리어는 지금 어디로 가야 할까?')] }],
    ['world', { id: 'hawaiian', name: '호오포노포노', han: 'Hoʻoponopono', glyph: '🌺', grad: 25, blurb: '하와이 전통의 용서·화해 성찰. 관계와 마음의 매듭을 풉니다.', grades: { H: 2, R: 1, P: 0, C: 2, X: 1 }, engine: 'consult', fields: [Fq('예) 풀고 싶은 관계나 마음의 응어리가 있다')],
      framework: fw('호오포노포노는 "미안합니다·용서하세요·감사합니다·사랑합니다" 네 마디로 매듭을 푸는 전통입니다.', [{ title: '책임', prompt: '이 상황에서 내가 (아주 작게라도) 기여한 부분이 있다면 무엇일까요?' }, { title: '용서', prompt: '나 자신 또는 상대에게 건넬 용서의 한 문장을 적어 보세요.' }, { title: '감사', prompt: '이 일이 가르쳐 준 것 한 가지에 감사를 표현해 보세요.' }], '성찰은 자기 치유를 돕습니다. 심한 트라우마는 전문가의 도움을 받으세요.') }],
    ['modern', { id: 'swot', name: 'SWOT 자기분석', han: 'SWOT', glyph: '🔲', grad: 16, blurb: '강점·약점·기회·위협으로 상황을 구조화해 전략을 세웁니다.', grades: { H: 1, R: 3, P: 1, C: 3, X: 1 }, engine: 'consult', fields: [Fq('예) 이 도전 앞에서 내 전략을 짜고 싶다')],
      framework: fw('SWOT는 "안(강점·약점)"과 "밖(기회·위협)"을 교차해 전략을 뽑는 고전 도구입니다.', [{ title: '강점×기회(SO)', prompt: '내 강점으로 지금의 기회를 잡는다면, 할 수 있는 한 수는?' }, { title: '약점×위협(WT)', prompt: '내 약점이 외부 위협과 만나면 가장 위험한 지점은? 어떻게 방어할까요?' }, { title: '우선 한 수', prompt: 'SO·WT 중 지금 당장 실행할 한 가지를 고르세요.' }], 'SWOT는 나열에서 끝나기 쉽습니다. 반드시 "그래서 할 한 가지"로 수렴하세요.') }]
  ];
  EXTRA.forEach(function (e) { var c = catOf(e[0]); if (c) c.items.push(e[1]); });

  // 평탄화
  var INTERACTIVE = [], byId = {};
  CATS.forEach(function (c) { c.items.forEach(function (s) { s.cat = c.key; s.catLabel = c.label; INTERACTIVE.push(s); byId[s.id] = s; }); });

  var api = { CATS: CATS, INTERACTIVE: INTERACTIVE, byId: byId, count: INTERACTIVE.length };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.systems = api;
})(typeof window !== 'undefined' ? window : globalThis);

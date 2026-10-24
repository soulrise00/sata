/*
 * readings.js — 전 체계 해석 생성기 (v2)
 * 원칙: 계산된 실제 값에 근거 · 상징과 현실의 분리 · 숙명 금지 ·
 *       사용자의 '고민'에 맞춘 설계 솔루션 + 판정 가능한 질문으로 연결.
 */
(function (root) {
  'use strict';
  var FL = root.FL || {};
  var V = FL.visuals, saju = FL.saju;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var ELEM_CLASS = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
  var ELEM_VAR = { '목': 'var(--e-wood)', '화': 'var(--e-fire)', '토': 'var(--e-earth)', '금': 'var(--e-metal)', '수': 'var(--e-water)' };

  function headline(big, sub, cls) { return '<div class="headline"><div class="big ' + (cls || '') + '">' + big + '</div>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>'; }
  function block(title, html) { return '<div class="block"><h4>' + title + '</h4>' + html + '</div>'; }
  function disclaimer(html) { return '<div class="disclaimer">' + html + '</div>'; }

  // 고민 맞춤 설계 솔루션 — 모든 결과에 삽입(질문 있을 때)
  function solution(q, name, lines) {
    if (!q) return '';
    lines = lines || [];
    return '<div class="block solution"><h4>🎯 당신의 고민에 맞춘 설계</h4>' +
      '<p class="muted">적어 주신 고민: <b>“' + esc(q) + '”</b></p>' +
      '<p>' + name + '의 관점은 <b>답을 정해 주는 것이 아니라</b>, 이 고민을 다시 보게 하는 거울입니다. 아래 설계를 오늘 바로 시작해 보세요.</p>' +
      '<ul class="list-tight">' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') +
      '<li><b>되돌릴 수 있는 작은 시험</b>: 2주 안에 실행할 작은 행동 1개를 정하고, 손실 한도를 미리 적어 두세요.</li>' +
      '<li><b>확인 날짜</b>: 달력에 점검일을 적고, 그날 “맞은 것·틀린 것·판단불가”를 함께 기록하세요(사후 맞춤 금지).</li>' +
      '</ul></div>';
  }

  function sixbox(q, extra) {
    extra = extra || {};
    function cell(b, s) { return '<div class="cell"><b>' + b + '</b><span>' + esc(s) + '</span></div>'; }
    return '<div class="block"><h4>판정 가능한 질문으로</h4><p class="muted" style="margin-bottom:10px">상징 해석을 "나중에 스스로 채점할 수 있는 예측"으로 바꾸는 여섯 칸입니다.</p><div class="sixbox">' +
      cell('대상', extra.target || '무엇/누구에 관한 일인가') + cell('사건', extra.event || '무엇이 일어나면 "발생"으로 볼 것인가') +
      cell('기간', extra.horizon || '언제부터 언제까지인가') + cell('조건', extra.cond || '어떤 전제가 유지되는가') +
      cell('확률', extra.prob || '지금 정보에서 몇 % 범위인가') + cell('반증', extra.refute || '무엇이 나오면 판단을 수정할 것인가') +
      '</div></div>';
  }

  var EVID = {
    trad: '이 결과는 전통 상징 체계의 해석입니다. <b>재현 가능한 계산</b>이지만 외부 사건 적중(P)은 보장하지 않습니다. 건강·법률·투자·생명 위험은 단독 근거로 쓰지 마세요.',
    oracle: '유리한 결과가 나올 때까지 다시 뽑지 않습니다 — 기록(seed)이 그 근거입니다. 상징은 선택을 <b>구조화</b>하는 도구이며, 질병·사망·범죄를 단정하지 않습니다.',
    profile: '민속·문화 상징 체계입니다. 사람을 몇 가지 유형으로 가두지 않으며, 개인의 선택과 환경을 대신하지 않습니다.',
    modern: '이것은 <b>검증형 방법</b>입니다. 결과를 보기 전에 예측을 고정하고, 정한 날짜에 같은 기준으로 채점하세요.'
  };

  // ───────── 사주 ─────────
  function sajuR(r, input) {
    var dm = r.dayMaster, st = r.strength, cl = r.climate;
    var cols = ['year', 'month', 'day', 'hour'], head = { year: '연주(年)', month: '월주(月)', day: '일주(日)', hour: '시주(時)' };
    function pcell(key) {
      var pd = r.pillarDetail[key]; if (!pd) return '<div><span class="mut">—</span></div>';
      return '<div><div class="gz ' + ELEM_CLASS[pd.stem.elem] + '">' + pd.stem.han + '</div><div class="ko">' + pd.stem.ko + '·' + (key === 'day' ? '일간' : pd.stemGod) + '</div>' +
        '<div class="gz ' + ELEM_CLASS[pd.branch.elem] + '" style="margin-top:6px">' + pd.branch.han + '</div><div class="ko">' + pd.branch.ko + '·' + pd.branch.animal + '</div>' +
        '<div class="ko" style="margin-top:4px;color:var(--ink-faint)">지장간 ' + pd.hiddenStems.join('·') + '</div></div>';
    }
    var grid = '<div class="mingsik"><div class="rh">구분</div>' + cols.map(function (c) { return '<div class="rh">' + head[c] + '</div>'; }).join('') +
      '<div class="rh">간지</div>' + cols.map(pcell).join('') + '</div>';
    var g = r.godCount;
    var groups = { '비겁(자아·경쟁)': (g['비견'] || 0) + (g['겁재'] || 0), '식상(표현·생산)': (g['식신'] || 0) + (g['상관'] || 0), '재성(재물·관리)': (g['편재'] || 0) + (g['정재'] || 0), '관성(규칙·책임)': (g['편관'] || 0) + (g['정관'] || 0), '인성(학습·보호)': (g['편인'] || 0) + (g['정인'] || 0) };
    var domKey = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a]; })[0];
    var GOD = { '비겁(자아·경쟁)': '자기 색과 추진력이 두드러집니다. 주도적으로 움직이되 역할·지분·비용을 문서로 분명히 하면 강점이 삽니다.', '식상(표현·생산)': '표현하고 만들어 내보내는 기운이 강합니다. "하나를 골라 마감일을 붙이는" 습관이 결실을 만듭니다.', '재성(재물·관리)': '자원·돈·대상을 다루는 기운이 강합니다. 우선순위와 손실 한도를 먼저 정하세요.', '관성(규칙·책임)': '규칙·책임·조직의 기운이 강합니다. 권한과 책임의 균형을 맞추면 과부하가 줄어듭니다.', '인성(학습·보호)': '배우고 받아들이는 기운이 강합니다. "작게 내보내는" 실행 통로가 필요합니다.' };
    var DM = { '목': '나무의 기운 — 뻗어 나가 연결하고 키우는 힘이 중심입니다.', '화': '불의 기운 — 드러내고 밝히며 속도를 내는 표현의 힘.', '토': '흙의 기운 — 받아들이고 쌓아 형태로 굳히는 안정의 힘.', '금': '쇠의 기운 — 가르고 정리해 결실을 맺는 판단의 힘.', '수': '물의 기운 — 저장하고 흐르며 다음을 준비하는 잠재의 힘.' };
    var STN = st.ratio >= 0.55 ? '자기 세력이 넉넉한 <b>신강</b>. 밀고 나가는 힘이 있으나 과하면 독주·소모 — 에너지를 쓸 통로와 결실로 흐르게 하면 균형이 잡힙니다.' : (st.ratio <= 0.42 ? '자기 세력이 얕은 <b>신약</b>. 섬세·수용적이나 과부하에 약함 — 길러 주는 자원·같은 편·현실 자원(팀·제도)으로 보완하면 기능이 삽니다.' : '치우치지 않은 <b>중화</b>에 가깝습니다. 적응력이 있으나 핵심 기준을 스스로 정해 두어야 흔들림이 줄어듭니다.');
    var body = headline(dm.han + dm.ko + ' 일간 · ' + dm.elem + '(' + ['木', '火', '土', '金', '水'][dm.elemIdx] + ')', st.label + ' · 조후 ' + cl.key + (r.pillars.hasHour ? '' : ' · 시각 미상'), ELEM_CLASS[dm.elem]);
    body += block('명식(命式) — 네 기둥', grid + '<p class="muted" style="margin-top:10px">태양황경 ' + r.pillars.sunLon.toFixed(1) + '° 기준. 절기·시간대 경계에서는 결과가 민감하니 출생 정보 정확도를 함께 보세요.</p>');
    body += block('오행 분포', V.orbs(r.balance, saju.ELEM));
    body += block('타고난 중심과 균형', '<p>' + DM[dm.elem] + '</p><p>' + STN + '</p><p><b>' + esc(domKey) + '</b> 기운이 두드러집니다. ' + GOD[domKey] + '</p><p class="muted">조후: ' + cl.desc + '</p>');
    body += block('조절점(용신) — ' + esc(r.useful.view), '<p>' + r.useful.why + ' 참고 오행: <span class="pill">' + r.useful.candidates.join('</span> <span class="pill">') + '</span></p><p class="muted">※ 학파마다 용신 기준이 다릅니다. "행운의 색" 하나로 단순화하지 않습니다.</p>');
    if (r.luck) {
      var lp = r.luck.pillars.map(function (d) { return '<div style="text-align:center;min-width:52px"><div class="gz ' + ELEM_CLASS[saju.ELEM[saju.stemObj(d.stem).elemIdx]] + '" style="font-size:1.2rem">' + saju.STEMS[d.stem] + saju.BRANCHES[d.branch] + '</div><div class="ko">' + d.age + '세~</div></div>'; }).join('');
      body += block('대운(大運) — 10년 흐름 · ' + (r.luck.forward ? '순행' : '역행') + ' · ' + r.luck.startAge + '세 시작', '<div style="display:flex;gap:10px;flex-wrap:wrap;overflow-x:auto">' + lp + '</div>');
    }
    body += solution(input.q, '사주명리', ['<b>' + esc(domKey.split('(')[0]) + '</b> 기운을 지금 고민에 어떻게 쓸지 한 가지만 정하세요.', '신강/신약 진단에 맞춰, 지금은 <b>' + (st.ratio >= 0.55 ? '덜어내고 흘려보내는' : '채우고 기대는') + '</b> 전략이 어울립니다.']);
    body += sixbox(input.q, { target: '나의 ' + (input.q ? '고민 영역' : '진로·관계·재물') });
    body += disclaimer('<b>읽는 법.</b> 사주는 타고난 기질의 <b>구조와 비유</b>입니다. 여덟 글자가 성장환경·선택·노력을 지우지 않습니다. ' + EVID.trad);
    return { bodyHtml: body };
  }

  // ───────── 주역/육효/하락/척전 ─────────
  function ichingR(r, input, sys) {
    var p = r.primary, mode = sys && sys.mode;
    var title = mode === 'yukhyo' ? '육효 · ' : (mode === 'harak' ? '하락이수 · ' : (mode === 'yut' ? '윷점 · ' : ''));
    var body = headline(p.upperSym + p.lowerSym + ' ' + title + '제' + p.num + '괘 · ' + p.han + '(' + p.ko + ')', esc(p.keyword) + ' · 위 ' + p.upper + '(' + p.upperNat + ') / 아래 ' + p.lower + '(' + p.lowerNat + ')');
    body += block('본괘(本卦) — 지금의 구조', '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">' + V.hexagram(p, r.movingIdx, true) + '<div style="flex:1;min-width:180px"><p><b>핵심:</b> ' + esc(p.keyword) + '</p><p><b>이 괘가 던지는 질문:</b> ' + esc(p.question) + '</p></div></div>');
    if (r.movingIdx.length) {
      var POS = FL.iching.POS, mv = r.movingIdx.map(function (i) { return (i + 1) + '효(' + POS[i] + ')'; }).join(', ');
      body += block('동효(動爻) — 지금 움직이는 층', '<p>' + mv + ' 이(가) 움직입니다. 이 자리가 현재 변동이 일어나는 지점입니다. 높낮이를 좋고 나쁨으로 바꾸지 말고 질문의 실제 역할과 연결해 읽습니다.</p>');
      if (r.changed) body += block('변괘(變卦) — 조건이 유지될 때의 전개', '<div class="two-hex"><div class="hex-box">' + V.hexagram(p, []) + '<div class="nm">' + p.han + ' ' + p.ko + '</div><div class="mut">본괘</div></div><div class="arrow">→</div><div class="hex-box">' + V.hexagram(r.changed, []) + '<div class="nm">' + r.changed.han + ' ' + r.changed.ko + '</div><div class="mut">변괘 · ' + esc(r.changed.keyword) + '</div></div></div><p style="margin-top:12px"><b>' + r.changed.han + '(' + r.changed.ko + ').</b> 지금의 선택과 환경이 계속될 때의 다음 구조입니다. <b>확정된 미래가 아니라</b> 조건부 시나리오로 읽습니다.</p>');
    } else {
      body += block('동효 없음 — 본괘로 안정', '<p>움직이는 효가 없습니다. 지금은 큰 변동보다 본괘의 구조 자체를 읽는 국면입니다.</p>');
    }
    body += block('호괘(互卦) — 겉질문 아래의 과정', '<p>' + r.nuclear.han + '(' + r.nuclear.ko + ') · ' + esc(r.nuclear.keyword) + '. 드러난 질문 아래에서 작동하는 중간 구조를 보조적으로 봅니다.</p>');
    body += solution(input.q, '주역', ['괘가 가리키는 핵심 — <b>' + esc(p.keyword) + '</b> — 을 지금 고민의 한 문장으로 바꿔 보세요.', (r.changed ? '변괘(<b>' + esc(r.changed.keyword) + '</b>)는 "이대로 두면 가는 방향"입니다. 그 방향이 원하는 결과인지 점검하세요.' : '동효가 없으니 지금은 큰 결정보다 현 구조를 다지는 때로 보입니다.')]);
    body += sixbox(input.q);
    body += disclaimer('<b>읽는 법.</b> 괘 이름의 길흉 한 단어로 단정하지 않습니다. ' + EVID.oracle);
    return { bodyHtml: body };
  }

  // ───────── 매화역수 ─────────
  function plumR(r, input) {
    var tone = r.relation.tone === 'good' ? 'var(--good)' : (r.relation.tone === 'warn' ? 'var(--warn)' : 'var(--ink-soft)');
    var body = headline(r.primary.han + '(' + r.primary.ko + ') · ' + esc(r.primary.keyword), '상 ' + r.upper + ' / 하 ' + r.lower + ' · ' + r.moving + '효 동');
    body += block('괘와 변화', '<div class="two-hex"><div class="hex-box">' + V.hexagram(r.primary, [r.moving - 1], true) + '<div class="nm">' + r.primary.han + ' ' + r.primary.ko + '</div><div class="mut">본괘</div></div><div class="arrow">→</div><div class="hex-box">' + V.hexagram(r.changed, []) + '<div class="nm">' + r.changed.han + ' ' + r.changed.ko + '</div><div class="mut">변괘 · ' + esc(r.changed.keyword) + '</div></div></div><p class="muted" style="margin-top:12px">호괘: ' + r.nuclear.han + '(' + r.nuclear.ko + ') · ' + esc(r.nuclear.keyword) + '</p>');
    body += block('체용(體用) — 나와 환경의 생극', '<p>나(체)는 <b>' + r.body + '(' + r.bodyElem + ')</b>, 환경·상대(용)는 <b>' + r.use + '(' + r.useElem + ')</b>.</p><p style="color:' + tone + '"><b>' + esc(r.relation.key) + '</b> — ' + esc(r.relation.desc) + '</p>');
    body += solution(input.q, '매화역수', ['체용 관계가 <b>' + esc(r.relation.key) + '</b>이니, 지금은 ' + (r.relation.tone === 'warn' ? '방어·보류' : (r.relation.tone === 'good' ? '적극적 전개' : '주도하되 대가 관리')) + '가 어울립니다.']);
    body += sixbox(input.q);
    body += disclaimer('매화역수의 체용 생극은 <b>경향</b>이지 확정이 아닙니다. ' + EVID.oracle);
    return { bodyHtml: body };
  }

  // ───────── 서양 점성(태양/데칸/오늘) ─────────
  var ZWHEEL = ['양', '황소', '쌍둥이', '게', '사자', '처녀', '천칭', '전갈', '사수', '염소', '물병', '물고기'];
  function westernR(r, input, sys) {
    var s = r.sign, mode = sys && sys.mode;
    var body = headline(s.sym + ' ' + s.ko + ' <span style="font-size:1rem;color:var(--ink-faint)">' + s.en + '</span>', s.elem + ' · ' + s.mode + ' · 지배행성 ' + s.ruler + ' · ' + s.dates);
    body += '<div class="block">' + V.wheel(r.signIndex, ZWHEEL) + '</div>';
    body += block('태양 별자리 — 의지와 중심', '<p>태어난 순간 태양은 황경 ' + r.sunLon.toFixed(1) + '°, 별자리 안 ' + r.degInSign.toFixed(1) + '°.</p><p><b>원소 ' + s.elem + ':</b> ' + r.elemDesc + '</p><p><b>양식 ' + s.mode + ':</b> ' + r.modeDesc + '</p><p><b>이 별자리의 질문:</b> ' + esc(s.q) + '</p>' + (r.boundary ? '<p class="muted">※ 별자리 경계(커스프) 근처 — 시각·시간대에 따라 이웃 별자리일 수 있습니다.</p>' : ''));
    if (mode === 'decan') {
      var dec = Math.floor(r.degInSign / 10) + 1;
      var decRuler = ['', '자기 자신(순수한 기운)', '같은 원소의 다음 별자리(응용·성숙)', '같은 원소의 마지막 별자리(완성·확장)'][dec];
      body += block('데칸(10도) — ' + s.ko + ' 제' + dec + '데칸', '<p>별자리를 10도씩 셋으로 나눈 세부 구간 중 <b>' + dec + '번째</b>에 속합니다. 이 데칸은 ' + decRuler + '의 색채를 더합니다 — 같은 별자리라도 결이 조금 달라집니다.</p>');
    }
    if (mode === 'today') {
      var seed = (new Date().getFullYear() * 366 + (new Date().getMonth() * 31) + new Date().getDate() + r.signIndex);
      var tones = ['문을 두드리기 좋은', '쉬어 가며 정비하기 좋은', '관계를 돌보기 좋은', '결실을 매듭짓기 좋은', '새로 배우기 좋은', '정리·비우기 좋은'];
      var t = tones[seed % tones.length];
      body += block('오늘의 흐름', '<p>오늘은 <b>' + t + ' 날</b>의 기운입니다. ' + s.ko + '의 강점(' + s.elem + '의 ' + ({ '불': '추진', '흙': '안정', '공기': '소통', '물': '공감' }[s.elem]) + ')을 한 가지 행동으로 써 보세요.</p>');
    }
    if (!r.hasTime) body += block('시각 미상 안내', '<p class="muted">출생 시각이 없으면 상승점·하우스는 읽지 않습니다. 시각을 알면 성향의 "무대"까지 볼 수 있습니다.</p>');
    body += solution(input.q, '서양 점성', ['당신 별자리의 질문 — "' + esc(s.q) + '" — 을 지금 고민에 그대로 던져 보세요.']);
    body += sixbox(input.q);
    body += disclaimer('태양 별자리는 성향의 <b>한 축</b>일 뿐입니다. ' + EVID.trad);
    return { bodyHtml: body };
  }

  // ───────── 달 별자리 / 상승점 ─────────
  function moonR(r, input) {
    var s = r.sign;
    var body = headline('☾ 달 ' + s.ko, '감정·습관·내면의 기본 리듬 · ' + s.elem + '/' + s.mode + (r.hasTime ? '' : ' · (시각 미상: 근사)'));
    body += '<div class="block">' + V.wheel(r.signIndex, ZWHEEL) + '</div>';
    body += block('마음의 바탕', '<p>달은 당신이 편안함을 느끼고 반응하는 방식을 상징합니다. <b>' + s.elem + '</b>의 달은 ' + ({ '불': '빠르고 솔직하게 감정을 드러내며, 활동으로 기분을 푼다', '흙': '안정과 실질에서 안심하며, 익숙함을 통해 회복한다', '공기': '말과 생각으로 감정을 처리하며, 대화로 풀린다', '물': '깊이 느끼고 공감하며, 혼자만의 시간으로 회복한다' }[s.elem]) + '는 경향입니다.</p><p class="muted">※ 달은 약 2.5일마다 별자리를 옮깁니다. 시각을 모르면 경계일 수 있으니 참고로 보세요.</p>');
    body += solution(input && input.q, '달 별자리', ['지금 고민에서 당신이 진짜로 원하는 <b>정서적 안정</b>이 무엇인지 한 줄로 적어 보세요.']);
    body += disclaimer(EVID.trad);
    return { bodyHtml: body };
  }
  function ascR(r, input) {
    if (!r.hasTime) return { bodyHtml: headline('상승점은 태어난 시각이 필요합니다', '') + block('안내', '<p>어센던트(상승점)는 1~2분 차이로도 달라질 만큼 시각에 민감합니다. 정확한 출생 시각을 입력하면 근사치를 보여 드립니다. 지금은 태양 별자리나 달 별자리를 먼저 체험해 보세요.</p>') };
    var s = r.sign;
    var body = headline('↑ 상승 ' + s.ko + ' (근사)', '세상에 드러나는 첫인상과 삶의 무대');
    body += block('드러나는 나', '<p>상승 별자리는 사람들이 당신을 처음 만났을 때 받는 인상과, 삶에 접근하는 방식을 상징합니다. <b>' + s.ko + '</b> 상승은 ' + esc(s.q) + ' 라는 태도로 세상을 대하는 결입니다.</p><p class="muted">※ 이 값은 6시 일출 가정의 간이 근사입니다. 정밀 하우스는 전문 천문 계산이 필요합니다.</p>');
    body += solution(input && input.q, '상승점', ['남에게 보이는 나와 속마음의 간극이 지금 고민과 관련 있나요? 그 간극을 한 줄로 적어 보세요.']);
    body += disclaimer(EVID.trad);
    return { bodyHtml: body };
  }

  // ───────── 수비학 ─────────
  function numerologyR(r, input, sys) {
    var mode = sys && sys.mode;
    var li = r.lifeInfo, py = r.personalYearInfo;
    if (mode === 'bday') {
      var day = input.birth ? +input.birth.split('-')[2] : 0;
      var bn = FL.numerology.reduce(day, false);
      var binfo = FL.numerology.LIFE[bn] || FL.numerology.LIFE[1];
      var b0 = headline('생일수 ' + bn + ' · ' + esc(binfo.kw), '태어난 날(' + day + '일)이 주는 타고난 재능 포인트');
      b0 += block('생일수 ' + bn, '<p>생일수는 당신이 자연스럽게 잘하는 "타고난 재능"을 가리킵니다. <b>' + esc(binfo.kw) + '</b> — ' + esc(binfo.desc) + '</p><p class="muted"><b>활용:</b> ' + esc(binfo.do) + '</p>');
      b0 += block('참고 — 생명경로수 ' + r.lifePath, '<p>' + esc(li.desc) + '</p>');
      b0 += solution(input.q, '생일수', ['타고난 재능(<b>' + esc(binfo.kw) + '</b>)을 지금 고민에 어떻게 쓸지 한 가지를 정하세요.']);
      b0 += disclaimer(EVID.profile);
      return { bodyHtml: b0 };
    }
    var body = headline('생명경로수 ' + r.lifePath + ' · ' + esc(li.kw), r.refYear + '년 개인해수 ' + r.personalYear + ' · ' + esc(py.kw));
    body += block('생명경로수 ' + r.lifePath, '<p>' + esc(li.desc) + '</p><p class="muted"><b>권장:</b> ' + esc(li.do) + '</p>');
    body += block('올해(' + r.refYear + ') 개인해수 ' + r.personalYear + ' — ' + esc(py.kw), '<p>' + esc(py.desc) + '</p><p class="muted"><b>권장:</b> ' + esc(py.do) + '</p>');
    body += solution(input.q, '수비학', ['올해의 개인해수(<b>' + esc(py.kw) + '</b>) 리듬에 맞춰, 지금 고민을 "올해 안에 할 일"과 "다음으로 미룰 일"로 나눠 보세요.']);
    body += disclaimer('수비학은 문자·수의 <b>상징</b> 체계입니다. ' + EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 생체리듬 ─────────
  function biorhythmR(r) {
    var t = r.target;
    var body = headline('생체리듬 · ' + t.year + '.' + t.month + '.' + t.day, '출생 후 ' + r.daysSinceBirth.toLocaleString() + '일째');
    body += block('세 주기', '<div class="bars">' + r.cycles.map(function (c) { var w = Math.abs(c.pct); return '<div class="bar-row"><span class="lab" style="color:' + c.color + '">' + c.ko.split('(')[0] + '</span><div class="bar-track"><div class="bar-fill" style="width:' + w + '%;background:' + c.color + (c.pct < 0 ? ';opacity:.5' : '') + '"></div></div><span class="val">' + (c.pct > 0 ? '+' : '') + c.pct + '%</span></div>'; }).join('') + '</div>' + r.cycles.map(function (c) { return '<p style="margin-top:8px"><b style="color:' + c.color + '">' + esc(c.ko) + ' ' + (c.rising ? '상승' : '하강') + ':</b> ' + esc(c.note) + '</p>'; }).join(''));
    body += disclaimer('<b>중요.</b> 23·28·33일 주기는 정확히 계산되지만, 여러 <b>대조연구에서 성과·사고 예측력은 지지되지 않았습니다</b>. 컨디션 참고용으로만 쓰세요.');
    return { bodyHtml: body };
  }

  // ───────── 띠 (+올해 운세) ─────────
  function zodiacR(r, input, sys) {
    var body = headline(r.animal + '띠 · ' + r.han + '(' + r.elem + ')', r.solarYear + '년생(입춘 기준) · ' + esc(r.trait.k));
    body += block('기질', '<p>' + esc(r.trait.s) + '</p><p class="muted"><b>주의:</b> ' + esc(r.trait.c) + '</p>');
    body += block('관계 — 삼합·육합·충', '<dl class="kv"><dt>삼합(크게 조화)</dt><dd>' + esc(r.harmony.samhap.join('띠 · ')) + '띠</dd><dt>육합(가까운 결속)</dt><dd>' + esc(r.harmony.yukhap) + '띠</dd><dt>충(긴장·자극)</dt><dd>' + esc(r.clash) + '띠</dd></dl><p class="muted" style="margin-top:8px">충이라고 나쁘고 합이라고 좋은 것이 아닙니다. 충은 변화·자극, 합은 결속을 함께 봅니다.</p>');
    if (sys && sys.mode === 'year' && r.yearFortune) body += block(r.yearFortune.year + '년 운세 — ' + r.yearFortune.label, '<p>' + r.yearFortune.text + '</p>');
    body += solution(input && input.q, '띠', ['올해 당신과 <b>삼합·육합</b>인 띠(' + esc(r.harmony.samhap.concat([r.harmony.yukhap]).join('·')) + ')인 사람에게 지금 고민을 상의해 보세요 — 결이 잘 맞습니다.']);
    body += disclaimer('띠는 한 해 1/12로 나눈 <b>민속 상징</b>입니다. ' + EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 현대 포사이트 (+기준율) ─────────
  function foresightR(r, input, sys) {
    var bandW = r.band[1] - r.band[0];
    var body = headline('발생 확률 중심 ' + r.central + '%', '기준율 ' + r.baseRatePct + '% → 신호 반영 ' + (r.shift >= 0 ? '+' : '') + r.shift + '%p');
    body += block('확률 추정', '<div class="prob"><span class="n">' + r.central + '%</span><span class="rng">합리적 범위 ' + r.band[0] + '~' + r.band[1] + '%</span></div>' + V.probBar(r.central, r.band) + '<p class="muted" style="margin-top:10px">단일 숫자보다 <b>범위</b>로 봅니다. 통제 가능성이 낮고 증거가 적을수록 범위를 넓게 둡니다.</p>');
    body += block('질문 운영정의', '<div class="sixbox"><div class="cell"><b>사건</b><span>' + esc(input.event || '—') + '</span></div><div class="cell"><b>기간</b><span>' + esc(input.horizon || '—') + '</span></div><div class="cell"><b>기준율</b><span>' + r.baseRatePct + '%</span></div><div class="cell"><b>통제 가능성</b><span>' + ({ low: '낮음', mid: '보통', high: '높음' }[r.controllability]) + '</span></div></div>');
    body += block('4대 미래 시나리오 (Dator)', '<div class="scen">' + r.scenarios.map(function (s) { return '<div class="s"><div class="t">' + s.icon + ' ' + esc(s.key) + '</div><p>' + esc(s.desc) + '</p></div>'; }).join('') + '</div>');
    body += block('사후채점 설계', '<ul class="list-tight"><li><b>작은 시험:</b> ' + esc(r.scoring.test) + '</li><li><b>판정 지표:</b> ' + esc(r.scoring.metric) + '</li><li><b>복기:</b> ' + esc(r.scoring.review) + '</li></ul>');
    body += disclaimer('이것이 <b>검증형 예측</b>입니다. ' + EVID.modern);
    return { bodyHtml: body };
  }

  // ───────── 카드 추출(타로/르노르망/오검/이파/플레잉/오라클/룬) ─────────
  function glyphFor(deck, c) {
    if (deck === 'tarot') return c.type === 'major' ? '✦' : ({ '완드': '🜂', '컵': '🜄', '소드': '🜁', '펜타클': '🜃' }[c.suit] || '◆');
    if (deck === 'lenormand') return c.num;
    if (deck === 'ogham') return c.rune;
    if (deck === 'ifa') return '🌍';
    if (deck === 'playing') return c.label;
    if (deck === 'oracle') return '🌟';
    return '✦';
  }
  function cardText(c, reversed) {
    if (reversed && c.reversed && c.canReverse !== false) return c.reversed;
    return c.upright || c.meaning || c.reading || '';
  }
  function drawR(r, input, sys) {
    var deck = sys.deck, positions = sys.positions;
    var deckKo = { tarot: '타로', lenormand: '르노르망', ogham: '오검', ifa: '이파', playing: '카토맨시', oracle: '오라클', runes: '룬' }[deck] || sys.name;
    var body = headline(sys.name, deckKo + ' · 뽑기 기록 seed ' + r.seed + ' (재현 가능)');
    // 비주얼
    if (deck === 'runes' || deck === 'ogham') body += '<div class="block">' + V.runes(r.picks, positions) + '</div>';
    else body += '<div class="block">' + V.cards(r.picks, positions, function (c) { return glyphFor(deck, c); }) + '</div>';
    // 자리별 읽기
    body += block('자리별 읽기', r.picks.map(function (pk, i) {
      var c = pk.card, txt = cardText(c, pk.reversed);
      return '<p><b>' + esc(positions[i] || ('카드 ' + (i + 1))) + ' — ' + esc(c.ko || c.name) + (pk.reversed && c.canReverse !== false ? '(역)' : '') + ':</b> ' + esc(txt) + '</p>';
    }).join(''));
    // 종합
    var last = r.picks[r.picks.length - 1].card;
    var syn = '';
    if (deck === 'tarot') { var majors = r.picks.filter(function (p) { return p.card.type === 'major'; }).length; syn = (majors >= Math.ceil(r.picks.length / 2)) ? '메이저 아르카나가 많아 지금은 <b>큰 흐름·전환</b>이 주제입니다. 세부보다 방향을 먼저 정하세요.' : '마이너가 중심이라 지금은 <b>구체적 일상·실무</b>의 조정이 주제입니다.'; }
    else if (deck === 'lenormand') syn = '르노르망은 카드를 <b>이어 하나의 문장</b>으로 읽습니다: ' + r.picks.map(function (pk) { return '<b>' + esc(pk.card.ko) + '</b>'; }).join(' → ');
    else syn = '뽑힌 상징들의 공통된 결을 한 문장으로 모아 지금 고민에 적용해 보세요.';
    body += block('종합', '<p>' + syn + '</p>' + (last.action ? '<p>마지막 카드 <b>' + esc(last.ko || last.name) + '</b>의 권장: ' + esc(last.action) + '</p>' : ''));
    body += solution(input.q, deckKo, ['펼쳐진 카드 중 <b>지금 가장 눈에 들어오는 한 장</b>이 당신 무의식이 고른 핵심입니다. 그 카드의 메시지를 오늘 행동 하나로 옮기세요.']);
    body += sixbox(input.q);
    body += disclaimer(EVID.oracle);
    return { bodyHtml: body };
  }

  // ───────── 조티샤(출생/나크샤트라/다샤) ─────────
  function vedicR(r, input, sys) {
    var mode = sys && sys.mode;
    var body = headline('달 별자리 ' + r.moonRashi + ' · ' + r.nak + ' 나크샤트라', '파다 ' + r.pada + ' · 나크샤트라 지배행성 ' + r.nakLordKo + (r.hasTime ? '' : ' · (시각 미상: 달 위치 근사)'));
    body += block('핵심 — 달과 별', '<p>인도 점성에서는 <b>달의 자리</b>가 마음의 바탕입니다. 당신의 달은 <b>' + r.moonRashi + '</b>에, 세부적으로 <b>' + r.nak + '</b> 나크샤트라(제' + r.pada + '파다)에 있습니다. 태양은 <b>' + r.sunRashi + '</b>에 있습니다.</p>');
    if (mode !== 'nak') {
      body += block('비므쇼타리 다샤 — 지금은 누구의 시기?', '<p>현재(약 만 ' + r.ageYears + '세) <b>' + r.current.ko + ' 마하다샤</b>를 지나는 중입니다 (' + r.current.startAge + '세~' + r.current.endAge + '세).</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' + r.timeline.slice(0, 6).map(function (t) { var cur = t === r.current; return '<div style="text-align:center;min-width:60px;padding:6px;border-radius:8px;' + (cur ? 'background:color-mix(in srgb,var(--accent) 18%,transparent);font-weight:700' : '') + '"><div>' + t.ko + '</div><div class="ko">' + t.startAge + '~' + t.endAge + '세</div></div>'; }).join('') + '</div>' +
        '<p class="muted" style="margin-top:8px">다샤 주인 행성이 상징하는 주제(' + ({ '케투': '내려놓음·영성', '금성': '관계·가치·예술', '태양': '자아·명예·권위', '달': '감정·가정·대중', '화성': '추진·경쟁·기술', '라후': '욕망·확장·새로움', '목성': '확장·학습·행운', '토성': '인내·책임·구조', '수성': '소통·학습·거래' }[r.current.ko]) + ')가 이 시기 당신 삶에서 활성화됩니다.</p>');
    }
    body += solution(input && input.q, '조티샤', ['지금 다샤(<b>' + (r.current ? r.current.ko : r.nakLordKo) + '</b>)의 주제에 지금 고민을 연결해 보세요 — 이 시기에 자연스럽게 커지는 요구입니다.']);
    body += (input && input.q ? sixbox(input.q) : '');
    body += disclaimer('아야남샤·달 위치 근사(~0.3°)로 나크샤트라 경계에서는 민감합니다. ' + EVID.trad);
    return { bodyHtml: body };
  }

  // ───────── 마야/아즈텍 ─────────
  function mayanR(r, input, sys) {
    var aztec = sys && sys.mode === 'aztec';
    var body = headline(r.tone + ' · ' + r.sign[0] + '(' + r.sign[1] + ')', (aztec ? '토날포왈리' : '쫄킨') + ' · 음조 ' + r.tone + ' ' + r.toneInfo[0] + ' · 장기력 ' + r.longCount);
    body += block('날의 상징(나왈)', '<p>당신이 태어난 날의 에너지는 <b>' + r.sign[0] + ' — ' + r.sign[2] + '</b>입니다. ' + esc(r.sign[3]) + '</p>');
    body += block('은하 음조 ' + r.tone + ' — ' + r.toneInfo[0], '<p>음조는 그 에너지를 "어떻게" 쓰는지를 말합니다: <b>' + r.toneInfo[0] + '</b> — ' + esc(r.toneInfo[1]) + '.</p><p class="muted">마야력(260일 쫄킨·장기력)은 날짜만으로 정확히 재현됩니다.</p>');
    body += solution(input && input.q, aztec ? '토날포왈리' : '마야 쫄킨', ['타고난 에너지 <b>' + r.sign[2] + '</b>를 지금 고민에 어떻게 쓸지 한 가지를 정하세요.']);
    body += disclaimer('달력 계산은 재현 가능하나, 점술적 해석은 문화 상징입니다. ' + EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 켈트 나무 ─────────
  function celticR(r, input) {
    var body = headline('🌳 ' + r.tree + ' (' + r.en + ')', r.range + ' · ' + esc(r.kw) + ' · 오검 ' + r.ogham);
    body += block('나무의 기질', '<p>' + esc(r.desc) + '</p>');
    body += solution(input && input.q, '켈트 나무점성', ['당신 나무(<b>' + r.tree + '</b>)의 강점 — ' + esc(r.kw) + ' — 을 지금 고민에 적용할 한 가지 방법을 적어 보세요.']);
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 일진/택일/무후르타 ─────────
  function iljinR(r, input, sys) {
    var label = sys && sys.mode === 'muhurta' ? '무후르타(좋은 때)' : (sys && sys.id === 'taekil' ? '택일' : '일진');
    var body = headline(r.ganzhi + ' (' + r.ganzhiKo + ') · ' + r.animal + '의 날', r.date + ' ' + r.weekday + '요일 · 오행 ' + r.elem + (r.term ? ' · 절기 ' + r.term : ''));
    body += block(label + ' — 오늘 쓰기 좋은 기운', '<p>' + esc(r.advice) + '</p>');
    body += solution(input && input.q, label, ['오늘 간지의 오행(<b>' + r.elem + '</b>)에 맞는 활동을 우선 배치해 보세요.', '중대한 결정은 오전의 맑은 기운에, 수습·정리는 늦은 시간에.']);
    body += disclaimer('택일은 보조 변수입니다. 핵심은 준비와 실력이며, 좋은 때는 그 위의 가산점입니다. ' + EVID.profile);
    return { bodyHtml: body };
  }
  function planetaryR(r) {
    var body = headline('🪐 ' + r.weekday + '요일 · ' + r.dayRuler + '의 날', r.date + ' · 지금은 ' + r.currentHour + '시');
    body += block('요일의 지배행성 — ' + r.dayRuler, '<p>오늘은 <b>' + r.dayRuler + '</b>이 다스리는 날입니다: ' + esc(r.dayRulerMeaning) + '.</p>');
    body += block('지금 이 시각 — ' + r.currentHour + '의 시간', '<p>현재는 <b>' + r.currentHour + '</b>의 행성시입니다: ' + esc(r.currentMeaning) + '. 이 기운에 어울리는 일을 지금 해 보세요.</p><p class="muted">※ 6시 일출·18시 일몰 가정의 간이 계산입니다.</p>');
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }
  function solartermR(r) {
    var body = headline('🌿 ' + r.current, r.date + ' · 다음 절기: ' + r.next + (r.daysToNext != null ? ' (약 ' + r.daysToNext + '일 뒤)' : ''));
    body += block('지금의 절기 — ' + r.current, '<p>자연의 리듬은 24절기로 흐릅니다. 지금은 <b>' + r.current + '</b>의 기운 속에 있습니다. 약 ' + (r.daysToNext || '며칠') + '일 뒤 <b>' + r.next + '</b>로 넘어갑니다.</p><p class="muted">사주·택일의 월 경계도 이 절기를 따릅니다.</p>');
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 성명학 / 작명 / 네임 수비학 ─────────
  function seongmyeongR(r, input) {
    if (r.error) return { bodyHtml: block('안내', '<p>' + esc(r.error) + '</p>') };
    function fc(f) { return '<div class="sixbox"></div>'; }
    function row(name, f) { var color = f.grade.indexOf('길') === 0 ? 'var(--good)' : (f.grade.indexOf('흉') === 0 ? 'var(--bad)' : 'var(--warn)'); return '<div class="cell"><b>' + name + ' (' + f.n + '획)</b><span style="color:' + color + '">' + f.grade + ' · ' + esc(f.kw) + '</span></div>'; }
    var body = headline('성명 사격(四格) 풀이', '이름 ' + r.chars.map(function (c) { return c.ch + '(' + c.s + ')'; }).join(' ') + ' · 총획 ' + r.total);
    body += block('사격과 81수리 길흉', '<div class="sixbox">' + row('원격(초년)', r.won) + row('형격(중년)', r.hyeong) + row('이격(사회)', r.i) + row('정격(총운)', r.jeong) + '</div>');
    body += solution(input && input.q, '성명학', ['사격 중 <b>흉</b>이 있어도 숙명이 아닙니다 — 호칭·필명·브랜드명으로 보완하거나, 그 기운(변동·주의)을 미리 관리하는 설계가 핵심입니다.']);
    body += disclaimer('성명학은 학파마다 획수·수리 기준이 다릅니다(여기서는 필획법). 이름이 사람의 가치를 결정하지 않습니다. ' + EVID.profile);
    return { bodyHtml: body };
  }
  function jakmyeongR(r) {
    var body = headline('작명 길수 추천 — 성 "' + esc(r.sur) + '" (' + r.surStroke + '획)', '이름 두 글자의 길한 획수 조합');
    body += block('추천 획수 조합', '<ul class="list-tight">' + r.suggestions.map(function (s) { return '<li><b>' + s.a + '획 + ' + s.b + '획</b> — 총격 ' + s.total + '획 (' + s.grade + ')</li>'; }).join('') + '</ul><p class="muted" style="margin-top:8px">이 획수에 맞는 한글/한자를 고르면 사격이 두루 길해집니다. 뜻·소리·음양오행도 함께 보세요.</p>');
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }
  function nameNumR(r, input, sys) {
    if (r.error) return { bodyHtml: block('안내', '<p>' + esc(r.error) + '</p>') };
    var li = FL.numerology.LIFE;
    var body = headline((sys && sys.mode === 'gematria' ? '게마트리아' : '네임 수비학') + ' — ' + esc(r.raw.toUpperCase()), '표현수 ' + r.expression + ' · 영혼수 ' + r.soul + ' · 인격수 ' + r.personality);
    body += block('세 가지 수', '<dl class="kv"><dt>표현수(' + r.expression + ')</dt><dd>' + esc((li[r.expression] || {}).kw || '') + ' — 세상에 드러내는 재능과 소명.</dd><dt>영혼수(' + r.soul + ')</dt><dd>' + esc((li[r.soul] || {}).kw || '') + ' — 마음 깊은 곳의 동기.</dd><dt>인격수(' + r.personality + ')</dt><dd>' + esc((li[r.personality] || {}).kw || '') + ' — 남에게 비치는 인상.</dd></dl>');
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 프로필(당사주/구성/토템/요일/혈액형/삼재) ─────────
  function profileR(r, input, sys) {
    var id = sys.id, body = '';
    if (id === 'dangsaju') { body = headline(r.star, '당사주 · ' + r.han + '(' + r.animal + '띠)'); body += block('타고난 별', '<p>당신의 당사주 별은 <b>' + r.star + '</b> — ' + esc(r.meaning) + '.</p><p>' + esc(r.desc) + '</p>'); }
    else if (id === 'gusung') { body = headline(r.name, '구성기학 본명성 · ' + r.elem + ' · ' + esc(r.kw)); body += block('본명성의 기질', '<p>' + esc(r.desc) + '</p><p class="muted">※ 본명성은 입춘 기준 생년의 구궁수입니다.</p>'); }
    else if (id === 'native') { body = headline('🦅 ' + r.animal + ' 토템', '아메리카 원주민 전통 · ' + r.range + ' · ' + esc(r.kw)); body += block('탄생 토템', '<p>' + esc(r.desc) + '</p>'); }
    else if (id === 'thaiday') { body = headline('📅 ' + r.day + '에 태어난 당신', r.color); body += block('요일의 기운', '<p>' + esc(r.desc) + '</p>'); }
    else if (id === 'bloodtype') { body = headline('🩸 ' + r.type, esc(r.kw)); body += block('성향', '<p>' + esc(r.desc) + '</p><p class="muted">※ 혈액형과 성격의 연관은 과학적으로 입증되지 않았습니다. 재미와 자기이해의 참고로만.</p>'); }
    else if (id === 'samjae') {
      body = headline(r.inSamjae ? '⚠️ 올해는 삼재입니다 (' + r.phase + ')' : '✅ 올해는 삼재가 아닙니다', r.animal + '띠 · ' + r.currentYear + '년(' + r.currentAnimal + '해)');
      body += block('나의 삼재 3년', '<p>' + r.animal + '띠의 삼재는 <b>' + r.samjaeAnimals.join('·') + '해</b>입니다 (9년마다 3년).</p>' + (r.inSamjae ? '<p>지금은 <b>' + r.phase + '</b>에 해당합니다. 큰 변동·투자·구설을 조심하고, 새로 벌이기보다 지키고 다지는 해로 삼으면 무탈합니다.</p>' : '<p>올해는 삼재가 아니니, 미뤄 둔 도전을 시도하기 좋은 해입니다.</p>'));
    }
    body += solution(input && input.q, sys.name, ['이 상징이 가리키는 강점을 지금 고민에 한 가지 적용해 보세요.']);
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 자미두수 ─────────
  function ziweiR(r, input) {
    var pal = r.palaces.map(function (p) { var hot = ['재백궁(財帛)', '관록궁(官祿)', '부처궁(夫妻)', '명궁(命宮)'].indexOf(p.palace) >= 0; return '<div class="cell"' + (hot ? ' style="border-color:var(--accent)"' : '') + '><b>' + p.palace.split('(')[0] + '</b><span>' + p.han + '(' + p.ko + ')' + (p.mean ? ' · ' + p.mean : '') + '</span></div>'; }).join('');
    var body = headline('명궁 ' + r.myeongHan + '(' + r.myeongKo + ')', '자미두수 간이 명반 · 신궁 ' + r.sinHan + (r.hasHour ? '' : ' · (시각 미상)'));
    body += block('명궁의 기질', '<p>' + esc(r.myeongTrait) + '</p>');
    body += block('십이궁 배치', '<div class="sixbox">' + pal + '</div><p class="muted" style="margin-top:8px">각 궁(삶의 영역)이 어느 지지에 놓였는지 봅니다. ※ 양력 월 근사이며, 정밀 명반은 음력 월·일·시와 성요 배치가 필요합니다.</p>');
    body += solution(input && input.q, '자미두수', ['지금 고민이 어느 궁(재백·관록·부처 등)의 일인지 먼저 정하고, 그 궁의 지지 기운에 맞춰 접근해 보세요.']);
    body += disclaimer(EVID.trad);
    return { bodyHtml: body };
  }

  // ───────── 토정비결 ─────────
  function toeR(r, input) {
    var months = r.months.map(function (m) { var color = m.mark === '길(吉)' ? 'var(--good)' : (m.mark === '주의' ? 'var(--warn)' : 'var(--ink-soft)'); return '<div class="cell"><b>' + m.m + '월 · <span style="color:' + color + '">' + m.mark + '</span></b><span>' + esc(m.tone) + '</span></div>'; }).join('');
    var body = headline(r.title, r.refYear + '년 신수 · ' + r.gwaeNum + '괘 · 세는나이 ' + r.age + '세');
    body += block('올해의 총운', '<p>' + esc(r.overall) + '</p>');
    body += block('월별 흐름', '<div class="sixbox">' + months + '</div>');
    body += solution(input && input.q, '토정비결', ['<b>길(吉)</b>로 표시된 달에 지금 고민의 중요한 결정·시도를 배치하고, <b>주의</b> 달엔 지키는 전략을 쓰세요.']);
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }

  // ───────── 지오맨시 ─────────
  function geomancyR(r, input) {
    var body = headline('지오맨시 — 판결: ' + r.judge.ko, '네 어머니 형상 + 판결 figure · seed ' + r.seed);
    body += '<div class="block"><div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">' + r.mothers.map(function (f, i) { return V.geoFigure(f, '어머니 ' + (i + 1)); }).join('') + '</div></div>';
    body += '<div class="block" style="text-align:center">' + V.geoFigure(r.judge, '판결(Judge)') + '<p style="margin-top:10px"><b>' + r.judge.ko + ' — ' + esc(r.judge.kw) + ':</b> ' + esc(r.judge.txt) + '</p></div>';
    body += block('증인(흐름)', '<p>오른쪽 증인 <b>' + r.witnesses[0].ko + '</b>(과거·원인), 왼쪽 증인 <b>' + r.witnesses[1].ko + '</b>(현재·방향)을 거쳐 판결 <b>' + r.judge.ko + '</b>에 이릅니다.</p>');
    body += solution(input.q, '지오맨시', ['판결 figure(<b>' + esc(r.judge.kw) + '</b>)가 가리키는 방향에 맞춰 지금 고민의 한 수를 정하세요.']);
    body += sixbox(input.q);
    body += disclaimer(EVID.oracle);
    return { bodyHtml: body };
  }

  // ───────── 주사위/도미노/조개 ─────────
  function diceR(r, input, sys) {
    var label = sys && sys.mode === 'domino' ? '도미노점' : (sys && sys.mode === 'cowrie' ? '조개점' : '주사위점');
    var body = headline(label + ' — ' + r.dice[0] + ' · ' + r.dice[1] + ' (합 ' + r.sum + ')', 'seed ' + r.seed);
    body += '<div class="block">' + V.dice(r.dice) + '</div>';
    body += block('풀이', '<p>' + esc(r.reading) + '</p>');
    body += solution(input.q, label, ['나온 수의 조언을 오늘 한 가지 행동으로 옮겨 보세요.']);
    body += disclaimer(EVID.oracle);
    return { bodyHtml: body };
  }

  // ───────── 진자/모점 ─────────
  function pendulumR(r, input, sys) {
    var label = sys && sys.set === 'mo' ? '티베트 모점' : '진자 다우징';
    var body = headline(label + ' — ' + r.answer, 'seed ' + r.seed);
    body += block('신탁', '<p style="font-size:1.1rem">' + esc(r.reading) + '</p>');
    body += solution(input.q, label, ['예/아니오는 "지금 이 조건에서"의 답입니다. 조건을 바꾸면 답도 달라질 수 있음을 기억하세요.']);
    body += disclaimer('예/아니오 신탁은 암시·심리 효과가 큽니다. 중요한 결정은 현실 자료와 함께 보세요. ' + EVID.oracle);
    return { bodyHtml: body };
  }

  // ───────── 설문(점수/조합) ─────────
  function guidedR(r, input, sys) {
    if (r.type === 'compose') {
      var body = headline(sys.name + ' 풀이', '선택하신 특징으로 읽은 결과');
      body += block('항목별 풀이', r.parts.map(function (p) { return '<p><b>' + esc(p.q) + '</b><br>' + esc(p.text) + '</p>'; }).join(''));
      body += solution(input && input.q, sys.name, ['드러난 강점 한 가지를 지금 고민에 어떻게 쓸지 정해 보세요.']);
      body += disclaimer(EVID.profile);
      return { bodyHtml: body };
    }
    var body2 = headline(r.result + (r.result.length <= 4 ? '' : '형'), sys.name + ' 결과');
    body2 += block('당신의 유형 — ' + r.result, '<p>' + esc(r.desc) + '</p>');
    body2 += solution(input && input.q, sys.name, ['이 유형의 강점을 지금 고민에 살리고, 약점이 발목 잡지 않도록 한 가지만 보완하세요.']);
    body2 += disclaimer('자가 응답 기반 유형화는 재미와 자기이해의 도구입니다. 사람을 고정 라벨로 가두지 마세요.');
    return { bodyHtml: body2 };
  }

  // ───────── 궁합 ─────────
  function relationshipR(r, input, sys) {
    var label = { saju: '사주 궁합', zodiac: '띠 궁합', western: '별자리 궁합', numerology: '수비학 궁합' }[r.method] || '궁합';
    var color = r.score >= 80 ? 'var(--good)' : (r.score >= 60 ? 'var(--warn)' : 'var(--bad)');
    var body = headline('<span style="color:' + color + '">' + r.score + '점</span> · ' + label, r.a + ' ↔ ' + r.b);
    body += block('관계의 결', r.notes.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join(''));
    body += solution(input && input.q, label, ['궁합 점수는 <b>합격증이 아닙니다</b>. 점수보다, 위에서 짚은 "조율이 필요한 지점"을 두 사람이 함께 규칙으로 정하는 것이 관계를 지킵니다.', '안전·존중·경제 정보 같은 <b>현실 사실</b>이 궁합 해석보다 우선합니다.']);
    body += disclaimer('궁합은 결혼·관계의 허가증이 아니라 대화의 재료입니다. ' + EVID.trad);
    return { bodyHtml: body };
  }

  // ───────── 상담형(consult) ─────────
  function consultR(r, input, sys) {
    var f = r.framework;
    var body = headline(sys.name + ' — 고민 설계', esc(sys.han));
    body += block('이 전통의 관점', '<p>' + esc(f.approach) + '</p>' + (r.question ? '<p class="muted">당신의 고민: <b>“' + esc(r.question) + '”</b></p>' : '') + (r.focus ? '<p class="muted">초점: ' + esc(r.focus) + '</p>' : ''));
    body += block('세 가지 렌즈로 보기', '<ol class="list-tight">' + f.lenses.map(function (l) { return '<li><b>' + esc(l.title) + '</b><br>' + esc(l.prompt) + '</li>'; }).join('') + '</ol>');
    body += block('실행 설계', '<ol class="list-tight">' + r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>');
    if (r.question) body += sixbox(r.question);
    body += disclaimer((f.caution ? esc(f.caution) + ' ' : '') + '이 결과는 전통/방법의 틀로 당신의 생각을 구조화한 것입니다. 답은 당신의 판단과 책임이 완성합니다.');
    return { bodyHtml: body };
  }

  // ───────── 몬테카를로 ─────────
  function monteR(r, input) {
    var body = headline('성공 확률 약 ' + r.prob + '%', (input.label || '추정') + ' · ' + r.runs.toLocaleString() + '회 시뮬레이션');
    body += block('분포 요약', '<dl class="kv"><dt>하위 10%(비관)</dt><dd>' + r.p10.toLocaleString() + '</dd><dt>중앙값(P50)</dt><dd>' + r.p50.toLocaleString() + '</dd><dt>상위 10%(낙관)</dt><dd>' + r.p90.toLocaleString() + '</dd><dt>목표 ' + r.target.toLocaleString() + ' 이상일 확률</dt><dd><b>' + r.prob + '%</b></dd></dl>');
    body += block('히스토그램', '<div class="histo">' + r.hist.map(function (h) { return '<div class="hbar" style="height:' + h + '%"></div>'; }).join('') + '</div><p class="muted" style="margin-top:6px">삼각분포(최소·예상·최대)로 ' + r.runs.toLocaleString() + '회 추출한 결과입니다.</p>');
    body += disclaimer('입력한 최소·예상·최대가 현실적일수록 결과가 유용합니다. ' + EVID.modern);
    return { bodyHtml: body };
  }

  // ───────── 꿈해몽 ─────────
  function dreamR(r, input) {
    if (!r.hits.length) return { bodyHtml: headline('꿈 상징을 찾지 못했어요', '') + block('안내', '<p>물·불·뱀·돈·이빨·죽음·하늘·산·바다·아기·집·길·비·꽃·시험·쫓김·추락·용·호랑이·돼지 등 상징 단어를 넣어 다시 적어 주세요.</p>') + disclaimer('꿈은 대개 그날의 감정·기억을 정리하는 과정입니다.') };
    var body = headline('꿈해몽 — ' + r.hits.map(function (h) { return h.key; }).join('·'), '전통 상징과 심리적 관점을 함께');
    body += block('상징 풀이', r.hits.map(function (h) { return '<p><b>' + esc(h.key) + '</b><br>🏮 전통: ' + esc(h.trad) + '<br>🧠 심리: ' + esc(h.psych) + '</p>'; }).join(''));
    body += solution(input.q, '꿈해몽', ['꿈의 감정(불안·설렘·슬픔 등)이 요즘 현실의 어떤 상황과 닮았는지 한 줄로 적어 보세요 — 꿈은 종종 낮의 고민을 비춥니다.']);
    body += disclaimer('전통 해몽은 민속 상징이며, 현대 심리학은 꿈을 기억·감정의 정리로 봅니다. 길흉을 단정하지 마세요.');
    return { bodyHtml: body };
  }

  // ───────── 십이시(지금) ─────────
  function sijinR(r) {
    var body = headline(r.ganzhi + ' 시 · ' + r.animal + '의 시간', r.date + ' ' + r.time + ' · ' + r.hourRange);
    body += block('지금 이 시각의 기운', '<p>지금은 <b>' + r.branchKo + '시(' + r.animal + ')</b>입니다. ' + esc(r.advice) + '</p>');
    body += disclaimer(EVID.profile);
    return { bodyHtml: body };
  }

  var MAP = {
    saju: sajuR, iching: ichingR, plum: plumR, western: westernR, moonsign: moonR, ascendant: ascR,
    numerology: numerologyR, biorhythm: biorhythmR, zodiac: zodiacR, foresight: foresightR,
    draw: drawR, vedic: vedicR, mayan: mayanR, celtic: celticR,
    iljin: iljinR, planetaryHours: planetaryR, solarterm: solartermR,
    seongmyeong: seongmyeongR, jakmyeong: jakmyeongR, nameNum: nameNumR,
    dangsaju: profileR, gusung: profileR, native: profileR, thaiday: profileR, bloodtype: profileR, samjae: profileR,
    ziwei: ziweiR, toe: toeR, geomancy: geomancyR, dice: diceR, pendulum: pendulumR,
    guided: guidedR, relationship: relationshipR, consult: consultR, montecarlo: monteR, dream: dreamR, sijin: sijinR
  };

  var api = { render: function (engine, result, input, sys) { return (MAP[engine] || function () { return { bodyHtml: '<p>준비 중입니다.</p>' }; })(result, input, sys); }, esc: esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.readings = api;
})(typeof window !== 'undefined' ? window : globalThis);

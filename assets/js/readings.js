/*
 * readings.js — 결과 해석 생성기
 * 엔진이 만든 '구조'를 성의 있는 해설로 번역한다. 원칙:
 *  - 계산된 실제 값에 근거한 구체적 서술(막연한 운세 금지)
 *  - 상징 해석과 현실 판단을 분리, 숙명·단정 금지
 *  - 삶에 적용: '판정 가능한 질문'(대상·사건·기간·조건·확률·반증)으로 연결
 */
(function (root) {
  'use strict';
  var FL = root.FL || {};
  var saju = FL.saju, hexData = FL.hexagrams, tarotData = FL.tarotData, runesData = FL.runesData, lenData = FL.lenormandData;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var ELEM_CLASS = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
  var ELEM_VAR = { '목': 'var(--e-wood)', '화': 'var(--e-fire)', '토': 'var(--e-earth)', '금': 'var(--e-metal)', '수': 'var(--e-water)' };

  // 공통: 삶에 적용(6칸) — 질문을 판정 가능한 문장으로
  function sixbox(q, extra) {
    extra = extra || {};
    return '<div class="block"><h4>삶에 적용 — 판정 가능한 질문으로</h4>' +
      '<p class="muted" style="margin-bottom:12px">상징 해석은 질문을 새롭게 보게 해 줍니다. 아래 여섯 칸을 직접 채우면, 나중에 "맞았다/틀렸다"를 스스로 채점할 수 있는 예측으로 바뀝니다.</p>' +
      '<div class="sixbox">' +
      cell('대상', extra.target || '무엇/누구에 관한 일인가') +
      cell('사건', extra.event || '무엇이 일어나면 "발생"으로 볼 것인가(관찰 가능하게)') +
      cell('기간', extra.horizon || '언제부터 언제까지인가') +
      cell('조건', extra.cond || '어떤 전제가 유지되는가') +
      cell('확률', extra.prob || '지금 정보에서 몇 % 범위인가') +
      cell('반증', extra.refute || '무엇이 나오면 판단을 수정할 것인가') +
      '</div>' +
      (q ? '<p class="muted" style="margin-top:12px">내 질문: “' + esc(q) + '”</p>' : '') +
      '</div>';
    function cell(b, s) { return '<div class="cell"><b>' + b + '</b><span>' + esc(s) + '</span></div>'; }
  }

  function disclaimer(html) { return '<div class="disclaimer">' + html + '</div>'; }

  // ───────────────────────── 사주 ─────────────────────────
  function sajuReading(r, input) {
    var dm = r.dayMaster, st = r.strength, cl = r.climate;
    var S = saju.STEMS, B = saju.BRANCHES, SK = saju.STEMS_KO, BK = saju.BRANCHES_KO;
    function gz(pil) {
      var se = saju.ELEM[['갑乙','丙'][0], 0]; // placeholder unused
      return pil;
    }
    // 명식표
    var cols = ['year', 'month', 'day', 'hour'];
    var head = { year: '연주(年)', month: '월주(月)', day: '일주(日)', hour: '시주(時)' };
    var hasHour = r.pillars.hasHour;
    function pcell(key) {
      var pd = r.pillarDetail[key];
      if (!pd) return '<div><span class="mut">—</span></div>';
      var scls = ELEM_CLASS[pd.stem.elem], bcls = ELEM_CLASS[pd.branch.elem];
      return '<div>' +
        '<div class="gz ' + scls + '">' + pd.stem.han + '</div><div class="ko">' + pd.stem.ko + ' · ' + (key === 'day' ? '일간' : pd.stemGod) + '</div>' +
        '<div class="gz ' + bcls + '" style="margin-top:6px">' + pd.branch.han + '</div><div class="ko">' + pd.branch.ko + ' · ' + pd.branch.animal + '</div>' +
        '<div class="ko" style="margin-top:4px;color:var(--ink-faint)">지장간 ' + pd.hiddenStems.join('·') + '</div>' +
        '</div>';
    }
    var grid = '<div class="mingsik">' +
      '<div class="rh">구분</div>' + cols.map(function (c) { return '<div class="rh">' + head[c] + '</div>'; }).join('') +
      '<div class="rh">간지</div>' + cols.map(function (c) { return pcell(c); }).join('') +
      '</div>';

    // 오행 바
    var bal = r.balance, total = bal.reduce(function (a, b) { return a + b; }, 0) || 1;
    var bars = '<div class="bars">' + saju.ELEM.map(function (e, i) {
      var pct = Math.round(bal[i] / total * 100);
      return '<div class="bar-row"><span class="lab" style="color:' + ELEM_VAR[e] + '">' + e + '(' + ['木','火','土','金','水'][i] + ')</span>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + ELEM_VAR[e] + '"></div></div>' +
        '<span class="val">' + pct + '%</span></div>';
    }).join('') + '</div>';

    // 십신 dominant
    var g = r.godCount;
    var groups = {
      '비겁(자아·경쟁)': (g['비견'] || 0) + (g['겁재'] || 0),
      '식상(표현·생산)': (g['식신'] || 0) + (g['상관'] || 0),
      '재성(재물·관리)': (g['편재'] || 0) + (g['정재'] || 0),
      '관성(규칙·책임)': (g['편관'] || 0) + (g['정관'] || 0),
      '인성(학습·보호)': (g['편인'] || 0) + (g['정인'] || 0)
    };
    var domKey = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a]; })[0];
    var GOD_NARR = {
      '비겁(자아·경쟁)': '자기 색과 추진력, 동료·경쟁의 기운이 두드러집니다. 주도적으로 움직이되, 혼자 떠안거나 소모적 경쟁에 휘말리지 않도록 역할·지분·비용분담을 문서로 분명히 하면 강점이 살아납니다.',
      '식상(표현·생산)': '표현하고 만들어 내보내는 기운이 두드러집니다. 아이디어·콘텐츠·기술로 드러내는 힘이 강점이나, 에너지가 흩어지기 쉬우니 "하나를 골라 마감일을 붙이는" 습관이 결실을 만듭니다.',
      '재성(재물·관리)': '자원·돈·대상을 관리하고 다루는 기운이 두드러집니다. 현실 감각과 운용력이 강점이나, 관리 부담이 커지기 쉬우니 우선순위와 손실 한도를 먼저 정하는 편이 좋습니다.',
      '관성(규칙·책임)': '규칙·책임·조직의 기운이 두드러집니다. 구조를 세우고 신뢰를 얻는 힘이 강점이나, 압박과 과부하를 조절할 장치(권한과 책임의 균형)가 필요합니다.',
      '인성(학습·보호)': '배우고 받아들이고 보호받는 기운이 두드러집니다. 학습·전문성·돌봄이 강점이나, 생각만 쌓고 실행이 늦어지지 않도록 "작게 내보내는" 통로가 필요합니다.'
    };

    // 일간 서술
    var DM = {
      '목': '나무의 기운 — 뻗어 나가 연결하고 계획하며 키우는 힘이 중심입니다.',
      '화': '불의 기운 — 드러내고 밝히고 속도를 내어 보이게 하는 힘이 중심입니다.',
      '토': '흙의 기운 — 받아들이고 쌓고 경계를 지어 형태로 굳히는 힘이 중심입니다.',
      '금': '쇠의 기운 — 가르고 정리하고 기준을 세워 결실을 맺는 힘이 중심입니다.',
      '수': '물의 기운 — 저장하고 흐르고 정보를 다루며 다음을 준비하는 힘이 중심입니다.'
    };
    var STN = st.ratio >= 0.55
      ? '자기 세력이 넉넉한 <b>신강</b> 쪽입니다. 주도적으로 밀고 나가는 힘이 있으나, 과하면 독주·소모로 흐를 수 있습니다. 에너지를 쓸 통로와 결실로 흐르게 할 때 균형이 잡힙니다.'
      : (st.ratio <= 0.42
        ? '자기 세력이 얕은 <b>신약</b> 쪽입니다. 섬세하고 수용적이지만 과부하에 약합니다. 나를 길러 주는 자원과 같은 편, 그리고 팀·제도·전문지식 같은 현실 자원으로 보완하면 기능이 살아납니다.'
        : '한쪽으로 치우치지 않은 <b>중화</b>에 가깝습니다. 상황 적응력이 있으나 핵심 기준을 스스로 정해 두어야 흔들림이 줄어듭니다.');

    var body = '';
    body += '<div class="headline"><div class="big ' + ELEM_CLASS[dm.elem] + '">' + dm.han + dm.ko + ' 일간 · ' + dm.elem + '(' + ['木','火','土','金','水'][dm.elemIdx] + ')</div>' +
      '<div class="sub">' + st.label + ' · 조후 ' + cl.key + (hasHour ? '' : ' · 시각 미상(시주 제외)') + '</div></div>';
    body += '<div class="block"><h4>명식(命式) — 네 기둥</h4>' + grid +
      '<p class="muted" style="margin-top:12px">태양황경 ' + r.pillars.sunLon.toFixed(1) + '° 기준으로 연·월주를, 율리우스일 기준으로 일주를, 시각으로 시주를 세웠습니다. 절기·시간대 경계에서는 결과가 민감하니 출생 정보의 정확도를 함께 보세요.</p></div>';
    body += '<div class="block"><h4>오행 분포</h4>' + bars + '</div>';
    body += '<div class="block"><h4>타고난 중심과 균형</h4><p>' + DM[dm.elem] + '</p><p>' + STN + '</p>' +
      '<p><b>' + esc(domKey) + '</b> 기운이 상대적으로 두드러집니다. ' + GOD_NARR[domKey] + '</p>' +
      '<p class="muted">조후: ' + cl.desc + '</p></div>';
    // 용신
    body += '<div class="block"><h4>조절점(용신) 관점 — ' + esc(r.useful.view) + '</h4>' +
      '<p>' + r.useful.why + ' 참고 오행: <span class="pill">' + r.useful.candidates.join('</span> <span class="pill">') + '</span></p>' +
      '<p class="muted">※ 학파마다 용신 기준(억부·조후·통관·병약)이 다릅니다. "행운의 색·물건" 하나로 단순화하지 않습니다.</p></div>';
    // 대운
    if (r.luck) {
      var lp = r.luck.pillars.map(function (d) {
        var se = saju.ELEM[saju.stemObj(d.stem).elemIdx];
        return '<div style="text-align:center;min-width:52px"><div class="gz ' + ELEM_CLASS[saju.stemObj(d.stem).elem] + '" style="font-size:1.2rem">' + saju.STEMS[d.stem] + saju.BRANCHES[d.branch] + '</div><div class="ko">' + d.age + '세~</div></div>';
      }).join('');
      body += '<div class="block"><h4>대운(大運) — 10년 흐름 · ' + (r.luck.forward ? '순행' : '역행') + ' · ' + r.luck.startAge + '세 시작</h4>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;overflow-x:auto">' + lp + '</div>' +
        '<p class="muted" style="margin-top:10px">대운은 원국의 잠재 구조가 어느 시기에 자극되는지를 봅니다. 시작 나이·순역은 계산법(절입 시각·환산)에 따라 달라지므로 참고값입니다.</p></div>';
    }
    body += sixbox(input.q, { target: '나의 ' + (input.q ? '질문 영역' : '진로·관계·재물 등') });
    body += disclaimer('<b>읽는 법.</b> 사주는 타고난 기질의 <b>구조와 비유</b>를 제공합니다. "여덟 글자"가 실제 성장환경·선택·노력을 지우지 않습니다. 건강·법률·투자·생명 위험처럼 손실이 큰 결정은 사주 해석을 <b>단독 근거로 쓰지 않습니다</b>. 이 결과는 재현 가능한 명식 계산(R)이며, 외부 사건 적중(P)을 보장하지 않습니다.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 주역 ─────────────────────────
  function hexVisual(hex, movingIdx) {
    movingIdx = movingIdx || [];
    // 위에서 아래로 그림(6효가 위): lines[5]..lines[0]
    var rows = '';
    for (var i = 5; i >= 0; i--) {
      var yin = hex.lines[i] === 0;
      var moving = movingIdx.indexOf(i) >= 0;
      rows += '<div class="ln ' + (yin ? 'yin' : '') + (moving ? ' moving' : '') + '"><span></span><span class="mid"></span><span></span></div>';
    }
    return '<div class="hexline">' + rows + '</div>';
  }
  function ichingReading(r, input) {
    var p = r.primary;
    var hv = hexVisual(p, r.movingIdx);
    var body = '';
    body += '<div class="headline"><div class="big">' + p.upperSym + p.lowerSym + ' 제' + p.num + '괘 · ' + p.han + '(' + p.ko + ')</div>' +
      '<div class="sub">' + esc(p.keyword) + ' · 위 ' + p.upper + '(' + p.upperNat + ') / 아래 ' + p.lower + '(' + p.lowerNat + ')</div></div>';
    body += '<div class="block"><h4>본괘(本卦) — 질문 시점의 구조</h4>' +
      '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">' + hv +
      '<div style="flex:1;min-width:180px"><p><b>핵심:</b> ' + esc(p.keyword) + '</p><p><b>상담에서 던질 질문:</b> ' + esc(p.question) + '</p></div></div></div>';

    // 동효
    if (r.movingIdx.length) {
      var POS = FL.iching.POS;
      var mv = r.movingIdx.map(function (i) { return (i + 1) + '효(' + POS[i] + ')'; }).join(', ');
      body += '<div class="block"><h4>동효(動爻) — 지금 실제로 움직이는 층</h4><p>' + mv + ' 이(가) 움직입니다. 이 자리가 현재 구조에서 변동이 일어나는 지점입니다. 높고 낮음을 좋고 나쁨으로 바꾸지 말고, 질문의 실제 역할과 연결해 읽습니다.</p></div>';
      if (r.changed) {
        body += '<div class="block"><h4>변괘(變卦) — 조건이 유지될 때의 전개</h4>' +
          '<div class="two-hex">' + hexBox(p, '본괘') + '<div class="arrow">→</div>' + hexBox(r.changed, '변괘') + '</div>' +
          '<p style="margin-top:12px"><b>' + r.changed.han + '(' + r.changed.ko + ') · ' + esc(r.changed.keyword) + '.</b> 지금의 선택과 환경이 계속될 때 나타날 수 있는 다음 구조입니다. <b>확정된 미래가 아니라</b> 조건부 시나리오로 읽습니다.</p></div>';
      }
    } else {
      body += '<div class="block"><h4>동효 없음 — 본괘로 안정</h4><p>움직이는 효가 없습니다. 지금은 큰 변동보다 본괘가 가리키는 구조 자체를 그대로 읽는 국면입니다.</p></div>';
    }
    // 호괘
    body += '<div class="block"><h4>호괘(互卦) — 겉질문 아래의 과정</h4><p>' + r.nuclear.han + '(' + r.nuclear.ko + ') · ' + esc(r.nuclear.keyword) + '. 드러난 질문 아래에서 작동하는 중간 구조·과정을 보조적으로 봅니다(본괘보다 가볍게).</p></div>';

    body += sixbox(input.q);
    body += disclaimer('<b>읽는 법.</b> 괘 이름의 길흉 한 단어로 단정하지 않습니다. "같은 질문을 유리한 답이 나올 때까지 다시 묻지 않기" — 이 결과의 동전 기록이 재현성의 근거입니다. 상징 해석(괘)과 현실 자료(계약·현금흐름·일정·검사)는 따로 정리해 충돌 지점을 기록하세요.');
    return { headline: null, bodyHtml: body };
    function hexBox(h, lab) { return '<div class="hex-box">' + hexVisual(h, []) + '<div class="nm">' + h.han + ' ' + h.ko + '</div><div class="mut">' + lab + ' · ' + esc(h.keyword) + '</div></div>'; }
  }

  // ───────────────────────── 매화역수 ─────────────────────────
  function plumReading(r, input) {
    var body = '';
    body += '<div class="headline"><div class="big">' + r.primary.han + '(' + r.primary.ko + ') · ' + esc(r.primary.keyword) + '</div>' +
      '<div class="sub">상 ' + r.upper + ' / 하 ' + r.lower + ' · ' + r.moving + '효 동</div></div>';
    body += '<div class="block"><h4>괘와 변화</h4><div class="two-hex">' +
      '<div class="hex-box">' + hexVisual(r.primary, [r.moving - 1]) + '<div class="nm">' + r.primary.han + ' ' + r.primary.ko + '</div><div class="mut">본괘</div></div>' +
      '<div class="arrow">→</div>' +
      '<div class="hex-box">' + hexVisual(r.changed, []) + '<div class="nm">' + r.changed.han + ' ' + r.changed.ko + '</div><div class="mut">변괘 · ' + esc(r.changed.keyword) + '</div></div>' +
      '</div><p style="margin-top:12px" class="muted">호괘: ' + r.nuclear.han + '(' + r.nuclear.ko + ') · ' + esc(r.nuclear.keyword) + '</p></div>';
    var tone = r.relation.tone === 'good' ? 'var(--good)' : (r.relation.tone === 'warn' ? 'var(--warn)' : 'var(--ink-soft)');
    body += '<div class="block"><h4>체용(體用) — 나와 환경의 생극</h4>' +
      '<p>나(체)는 <b>' + r.body + '(' + r.bodyElem + ')</b>, 환경·상대(용)는 <b>' + r.use + '(' + r.useElem + ')</b> 입니다.</p>' +
      '<p style="color:' + tone + '"><b>' + esc(r.relation.key) + '</b> — ' + esc(r.relation.desc) + '</p></div>';
    body += sixbox(input.q);
    body += disclaimer('매화역수는 상(象)의 변화를 빠르게 읽는 방법입니다. 체용의 생극은 <b>경향</b>이지 확정이 아닙니다. 현실 자료와 충돌하면 상징을 자동으로 우선하지 마세요.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 서양 점성 ─────────────────────────
  function westernReading(r, input) {
    var s = r.sign;
    var body = '';
    body += '<div class="headline"><div class="big">' + s.sym + ' ' + s.ko + ' <span style="font-size:1rem;color:var(--ink-faint)">' + s.en + '</span></div>' +
      '<div class="sub">' + s.elem + ' · ' + s.mode + ' · 지배행성 ' + s.ruler + ' · ' + s.dates + '</div></div>';
    body += '<div class="block"><h4>태양 별자리 — 의지와 중심의 방향</h4>' +
      '<p>태어난 순간 태양은 황경 ' + r.sunLon.toFixed(1) + '°, 별자리 안 ' + r.degInSign.toFixed(1) + '°에 있었습니다.</p>' +
      '<p><b>원소 — ' + s.elem + ':</b> ' + r.elemDesc + '</p>' +
      '<p><b>양식 — ' + s.mode + ':</b> ' + r.modeDesc + '</p>' +
      '<p><b>이 별자리가 던지는 질문:</b> ' + esc(s.q) + '</p>' +
      (r.boundary ? '<p class="muted">※ 별자리 경계(커스프) 근처입니다. 출생 시각·시간대에 따라 이웃 별자리일 수 있으니 참고하세요.</p>' : '') +
      '</div>';
    if (!r.hasTime) {
      body += '<div class="block"><h4>시각 미상 안내</h4><p class="muted">출생 시각이 없으면 상승점(어센던트)·하우스·달의 정밀 위치는 읽지 않습니다(원전 원칙). 시각을 알면 성향의 "무대"와 생활 영역까지 볼 수 있습니다.</p></div>';
    }
    body += sixbox(input.q);
    body += disclaimer('태양 별자리는 성향의 <b>한 축</b>일 뿐, 사람 전체가 아닙니다. 대중 성격설로 끝내지 말고 관찰 가능한 행동 질문으로 바꾸어 보세요. 별자리는 재현 가능한 천문 계산(R)이며 외부 사건 적중(P)과는 별개입니다.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 카드 공통 ─────────────────────────
  function cardFaces(picks, positions, glyphOf) {
    return '<div class="card-row">' + picks.map(function (pk, i) {
      var c = pk.card;
      return '<div class="card-face' + (pk.reversed ? ' rev' : '') + '">' +
        (positions ? '<div class="pos">' + esc(positions[i] || ('카드 ' + (i + 1))) + '</div>' : '') +
        '<div class="glyph">' + glyphOf(c) + '</div>' +
        '<div class="cname">' + esc(c.ko || c.name) + (pk.reversed ? ' <span style="color:var(--warn)">역</span>' : '') + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  function tarotReading(r, input) {
    var spread = tarotData.SPREADS[input.spread] || tarotData.SPREADS.three;
    var body = '<div class="headline"><div class="big">타로 · ' + esc(spread.ko) + '</div><div class="sub">뽑기 기록 seed ' + r.seed + ' (재현 가능)</div></div>';
    body += '<div class="block"><h4>펼친 카드</h4>' + cardFaces(r.picks, spread.positions, function (c) { return c.type === 'major' ? '✦' : ({ '완드': '🜂', '컵': '🜄', '소드': '🜁', '펜타클': '🜃' }[c.suit] || '◆'); }) + '</div>';
    body += '<div class="block"><h4>자리별 읽기</h4>' + r.picks.map(function (pk, i) {
      var c = pk.card;
      return '<p><b>' + esc(spread.positions[i]) + ' — ' + esc(c.ko || c.name) + (pk.reversed ? '(역)' : '') + ':</b> ' + esc(pk.reversed ? c.reversed : c.upright) + '</p>';
    }).join('') + '</div>';
    // 종합
    var majors = r.picks.filter(function (p) { return p.card.type === 'major'; }).length;
    body += '<div class="block"><h4>종합 — 현재·장애·행동</h4>' +
      '<p>' + (majors >= Math.ceil(r.picks.length / 2) ? '메이저 아르카나가 많아 지금은 <b>큰 흐름·전환</b>이 주제입니다. 세부보다 방향을 먼저 정하세요.' : '마이너가 중심이라 지금은 <b>구체적 일상·실무</b>의 조정이 주제입니다.') + '</p>' +
      '<p>마지막 카드 <b>' + esc(r.picks[r.picks.length - 1].card.ko) + '</b>의 권장 행동: ' + esc(r.picks[r.picks.length - 1].card.action) + '</p></div>';
    body += sixbox(input.q);
    body += disclaimer('타로는 카드 뜻을 "맞히는" 시험이 아니라 질문을 <b>구조화</b>하는 도구입니다. 사망·질병·임신·범죄를 카드로 단정하지 않습니다. 유리한 카드가 나올 때까지 다시 뽑지 않기 — seed가 그 기록입니다.');
    return { headline: null, bodyHtml: body };
  }

  function runesReading(r, input) {
    var spread = runesData.SPREADS[input.spread] || runesData.SPREADS.three;
    var body = '<div class="headline"><div class="big">룬 · ' + esc(spread.ko) + '</div><div class="sub">엘더 푸사르크 · seed ' + r.seed + '</div></div>';
    body += '<div class="block"><h4>뽑은 룬</h4>' + cardFaces(r.picks, spread.positions, function (c) { return c.rune; }) + '</div>';
    body += '<div class="block"><h4>자리별 읽기</h4>' + r.picks.map(function (pk, i) {
      var c = pk.card;
      var txt = (pk.reversed && c.canReverse) ? c.reversed : c.meaning;
      return '<p><b>' + esc(spread.positions[i]) + ' — ' + esc(c.name) + '(' + esc(c.kw) + ')' + (pk.reversed && c.canReverse ? ' 역' : '') + ':</b> ' + esc(txt) + '</p>';
    }).join('') + '</div>';
    body += sixbox(input.q);
    body += disclaimer('룬은 북유럽 문자 상징 체계입니다. 일부 룬은 역방향이 없습니다. 조언을 관찰 가능한 행동으로 바꾸어 적용하세요.');
    return { headline: null, bodyHtml: body };
  }

  function lenormandReading(r, input) {
    var spread = lenData.SPREADS[input.spread] || lenData.SPREADS.three;
    var body = '<div class="headline"><div class="big">르노르망 · ' + esc(spread.ko) + '</div><div class="sub">조합으로 읽는 카드 · seed ' + r.seed + '</div></div>';
    body += '<div class="block"><h4>펼친 카드</h4>' + cardFaces(r.picks, spread.positions, function (c) { return c.num; }) + '</div>';
    body += '<div class="block"><h4>한 문장으로 잇기</h4><p>' + r.picks.map(function (pk) { return '<b>' + esc(pk.card.ko) + '</b>'; }).join(' → ') + '</p>' +
      r.picks.map(function (pk, i) { return '<p><b>' + esc(spread.positions[i]) + ' · ' + esc(pk.card.ko) + ':</b> ' + esc(pk.card.reading) + '</p>'; }).join('') + '</div>';
    body += sixbox(input.q);
    body += disclaimer('르노르망은 카드 하나하나보다 <b>조합의 흐름</b>으로 읽습니다. 결과를 본 뒤 카드 뜻을 바꾸지 마세요.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 수비학 ─────────────────────────
  function numerologyReading(r, input) {
    var li = r.lifeInfo, py = r.personalYearInfo;
    var body = '<div class="headline"><div class="big">생명경로수 ' + r.lifePath + ' · ' + esc(li.kw) + '</div>' +
      '<div class="sub">' + r.refYear + '년 개인해수 ' + r.personalYear + ' · ' + esc(py.kw) + '</div></div>';
    body += '<div class="block"><h4>생명경로수 ' + r.lifePath + '</h4><p>' + esc(li.desc) + '</p><p class="muted"><b>권장:</b> ' + esc(li.do) + '</p></div>';
    body += '<div class="block"><h4>올해(' + r.refYear + ') 개인해수 ' + r.personalYear + ' — ' + esc(py.kw) + '</h4><p>' + esc(py.desc) + '</p><p class="muted"><b>권장:</b> ' + esc(py.do) + '</p></div>';
    body += disclaimer('수비학은 문자·수의 <b>상징</b> 체계입니다. 생명경로수는 생년월일에서 재현 가능하게 계산되지만, 외부 사건 예측력은 검증되지 않았습니다. 성향 서술을 자기점검의 거울로 쓰세요.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 생체리듬 ─────────────────────────
  function biorhythmReading(r, input) {
    var t = r.target;
    var body = '<div class="headline"><div class="big">생체리듬 · ' + t.year + '.' + t.month + '.' + t.day + '</div>' +
      '<div class="sub">출생 후 ' + r.daysSinceBirth.toLocaleString() + '일째</div></div>';
    body += '<div class="block"><h4>세 주기</h4><div class="bars">' + r.cycles.map(function (c) {
      var w = Math.abs(c.pct);
      return '<div class="bar-row"><span class="lab" style="color:' + c.color + '">' + c.ko.split('(')[0] + '</span>' +
        '<div class="bar-track" style="position:relative"><div class="bar-fill" style="width:' + w + '%;background:' + c.color + (c.pct < 0 ? ';opacity:.5' : '') + '"></div></div>' +
        '<span class="val">' + (c.pct > 0 ? '+' : '') + c.pct + '%</span></div>';
    }).join('') + '</div>' +
      r.cycles.map(function (c) { return '<p style="margin-top:8px"><b style="color:' + c.color + '">' + esc(c.ko) + ' ' + (c.rising ? '상승' : '하강') + ':</b> ' + esc(c.note) + '</p>'; }).join('') + '</div>';
    body += disclaimer('<b>중요.</b> 생체리듬의 23·28·33일 주기는 정확히 계산(재현)되지만, 여러 <b>대조연구에서 성과·사고 예측력은 지지되지 않았습니다</b>. 컨디션을 돌아보는 참고용으로만 쓰고, 중요한 결정의 근거로 삼지 마세요.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 띠 ─────────────────────────
  function zodiacReading(r, input) {
    var body = '<div class="headline"><div class="big">' + r.animal + '띠 · ' + r.han + '(' + r.elem + ')</div>' +
      '<div class="sub">' + r.solarYear + '년생(입춘 기준) · ' + esc(r.trait.k) + '</div></div>';
    body += '<div class="block"><h4>기질</h4><p>' + esc(r.trait.s) + '</p><p class="muted"><b>주의:</b> ' + esc(r.trait.c) + '</p></div>';
    body += '<div class="block"><h4>관계 — 삼합·육합·충</h4>' +
      '<dl class="kv"><dt>삼합(크게 조화)</dt><dd>' + esc(r.harmony.samhap.join('띠 · ')) + '띠</dd>' +
      '<dt>육합(가까운 결속)</dt><dd>' + esc(r.harmony.yukhap) + '띠</dd>' +
      '<dt>충(긴장·대립)</dt><dd>' + esc(r.clash) + '띠</dd></dl>' +
      '<p class="muted" style="margin-top:10px">관계는 "충"이라고 나쁘고 "합"이라고 좋은 것이 아닙니다. 충은 변화·자극, 합은 결속·때로 지연을 함께 봅니다.</p></div>';
    body += disclaimer('띠는 태어난 해의 지지에 동물을 붙인 <b>민속·문화 상징</b>입니다. 한 해 1/12로 사람을 나누는 틀일 뿐, 개인의 선택과 환경을 대신하지 않습니다.');
    return { headline: null, bodyHtml: body };
  }

  // ───────────────────────── 현대 포사이트 ─────────────────────────
  function foresightReading(r, input) {
    var bandW = r.band[1] - r.band[0];
    var body = '<div class="headline"><div class="big">발생 확률 중심 ' + r.central + '%</div>' +
      '<div class="sub">기준율 ' + r.baseRatePct + '% → 신호 반영 ' + (r.shift >= 0 ? '+' : '') + r.shift + '%p</div></div>';
    body += '<div class="block"><h4>확률 추정</h4>' +
      '<div class="prob"><span class="n">' + r.central + '%</span><span class="rng">합리적 범위 ' + r.band[0] + '~' + r.band[1] + '%</span></div>' +
      '<div class="prob-track"><div class="prob-band" style="left:' + r.band[0] + '%;width:' + bandW + '%"></div><div class="prob-center" style="left:' + r.central + '%"></div></div>' +
      '<p class="muted" style="margin-top:10px">단일 숫자보다 <b>범위</b>로 봅니다. 통제 가능성이 낮고 증거가 적을수록 범위를 넓게 둡니다.</p></div>';
    body += '<div class="block"><h4>질문 운영정의</h4><div class="sixbox">' +
      '<div class="cell"><b>사건</b><span>' + esc(input.event || '—') + '</span></div>' +
      '<div class="cell"><b>기간</b><span>' + esc(input.horizon || '—') + '</span></div>' +
      '<div class="cell"><b>기준율</b><span>' + r.baseRatePct + '%</span></div>' +
      '<div class="cell"><b>통제 가능성</b><span>' + ({ low: '낮음', mid: '보통', high: '높음' }[r.controllability]) + '</span></div>' +
      '</div></div>';
    body += '<div class="block"><h4>4대 미래 시나리오 (Dator)</h4><div class="scen">' +
      r.scenarios.map(function (s) { return '<div class="s"><div class="t">' + s.icon + ' ' + esc(s.key) + '</div><p>' + esc(s.desc) + '</p></div>'; }).join('') + '</div></div>';
    body += '<div class="block"><h4>사후채점 설계 — 맞았는지 확인하는 법</h4>' +
      '<ul class="list-tight"><li><b>작은 시험:</b> ' + esc(r.scoring.test) + '</li>' +
      '<li><b>판정 지표:</b> ' + esc(r.scoring.metric) + '</li>' +
      '<li><b>복기:</b> ' + esc(r.scoring.review) + '</li></ul></div>';
    body += disclaimer('이것이 <b>검증형 예측</b>입니다. 전통 체계와 달리 결과를 보기 전 확률을 고정하고, 정한 날짜에 같은 기준으로 채점합니다. 범위를 좁게 만든 근거를 적어 두면 다음 예측의 보정(calibration)이 좋아집니다.');
    return { headline: null, bodyHtml: body };
  }

  var MAP = {
    saju: sajuReading, iching: ichingReading, plum: plumReading, western: westernReading,
    tarot: tarotReading, runes: runesReading, lenormand: lenormandReading,
    numerology: numerologyReading, biorhythm: biorhythmReading, zodiac: zodiacReading, foresight: foresightReading
  };

  var api = { render: function (engine, result, input) { return (MAP[engine] || function () { return { bodyHtml: '<p>준비 중입니다.</p>' }; })(result, input); }, esc: esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.readings = api;
})(typeof window !== 'undefined' ? window : globalThis);

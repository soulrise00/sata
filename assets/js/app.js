/*
 * app.js — 플랫폼 컨트롤러 (v2, 100+ 체계)
 */
(function () {
  'use strict';
  var FL = window.FL;
  var S = FL.systems, EV = FL.evidence, IC = FL.icons, RD = FL.readings;

  function h(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
  function qs(s, r) { return (r || document).querySelector(s); }
  var toastTimer;
  function toast(msg) { var t = qs('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200); }
  function dateParts(s) { if (!s) return null; var p = s.split('-'); return { year: +p[0], month: +p[1], day: +p[2] }; }
  function timeParts(s) { if (!s) return null; var p = s.split(':'); return { hour: +p[0], minute: +p[1] }; }

  // ───────── 허브 ─────────
  function renderHub() {
    var legend = qs('#evidence-legend');
    legend.innerHTML = '<h2>' + IC.logo.replace('class="logo"', 'style="width:26px;height:26px;vertical-align:middle"') + ' 결과를 믿기 전에 — 다섯 가지 근거 등급</h2>' +
      '<p class="sub">각 체계가 <b>무엇을 보장하고 무엇은 보장하지 않는지</b>를 숨기지 않습니다. "오래됨(H)·재현 가능(R)·상담에 유용(C)"과 "실제 사건을 잘 맞힘(P)"은 서로 다른 사실입니다.</p>' +
      '<div class="grade-row">' + ['H', 'R', 'P', 'C', 'X'].map(function (k) { var g = EV.GRADES[k]; return '<div class="grade-card"><span class="grade-badge g-' + k + '">' + k + '</span><h3>' + g.ko + '</h3><p>' + g.desc + '</p></div>'; }).join('') + '</div>';

    var wrap = qs('#experience-grid'); wrap.innerHTML = '';
    S.CATS.forEach(function (cat) {
      var sec = h('div', { 'data-cat': cat.key });
      sec.appendChild(h('div', { class: 'cat-label' }, '<span class="bar"></span><h3>' + cat.label + '</h3><span class="mut">' + cat.items.length + '개 · ' + cat.desc + '</span>'));
      var grid = h('div', { class: 'grid' });
      cat.items.forEach(function (sys) { grid.appendChild(sysCard(sys)); });
      sec.appendChild(grid);
      wrap.appendChild(sec);
    });
    qs('#sys-count') && (qs('#sys-count').textContent = S.count);
  }

  function sysCard(sys) {
    var card = h('button', { class: 'sys-card live', 'data-id': sys.id, 'data-search': (sys.name + ' ' + sys.han + ' ' + sys.blurb).toLowerCase(), 'aria-label': sys.name + ' 체험하기' });
    card.innerHTML = IC.render({ glyph: sys.glyph, grad: sys.grad }) +
      '<div class="nm">' + sys.name + '<span class="han">' + sys.han + '</span></div>' +
      '<div class="desc">' + sys.blurb + '</div>' +
      '<div class="foot">' + EV.mini(sys.grades) + '<span class="go">체험 →</span></div>';
    card.addEventListener('click', function () { openExperience(sys.id); });
    return card;
  }

  function applySearch(term) {
    term = (term || '').trim().toLowerCase();
    var any = {};
    document.querySelectorAll('.sys-card').forEach(function (c) {
      var match = !term || c.getAttribute('data-search').indexOf(term) >= 0;
      c.hidden = !match;
      if (match) any[c.closest('[data-cat]').getAttribute('data-cat')] = true;
    });
    document.querySelectorAll('[data-cat]').forEach(function (sec) { sec.hidden = term && !any[sec.getAttribute('data-cat')]; });
  }

  // ───────── 입력 폼 ─────────
  function buildField(f, formEl) {
    var wrap = h('div', { class: 'field' });
    if (f.showIf) wrap.setAttribute('data-showif', f.showIf.join('='));
    if (f.label) wrap.appendChild(h('label', { for: 'fld-' + f.key }, f.label));
    var input;
    if (f.type === 'date') input = h('input', { type: 'date', id: 'fld-' + f.key, 'data-key': f.key });
    else if (f.type === 'time') input = h('input', { type: 'time', id: 'fld-' + f.key, 'data-key': f.key });
    else if (f.type === 'number') input = h('input', { type: 'number', id: 'fld-' + f.key, 'data-key': f.key, placeholder: f.placeholder || '' });
    else if (f.type === 'text') input = h('input', { type: 'text', id: 'fld-' + f.key, 'data-key': f.key, placeholder: f.placeholder || '' });
    else if (f.type === 'textarea') input = h('textarea', { id: 'fld-' + f.key, 'data-key': f.key, rows: '2', placeholder: f.placeholder || '' });
    else if (f.type === 'select') { input = h('select', { id: 'fld-' + f.key, 'data-key': f.key }); f.options.forEach(function (o) { var op = h('option', { value: o[0] }, o[1]); if (f.default === o[0]) op.selected = true; input.appendChild(op); }); }
    else if (f.type === 'seg') {
      input = h('div', { class: 'seg', 'data-key': f.key, 'data-val': f.default || f.options[0][0] });
      f.options.forEach(function (o) { var b = h('button', { type: 'button' }, o[1]); b.setAttribute('aria-pressed', (f.default || f.options[0][0]) === o[0] ? 'true' : 'false'); b.addEventListener('click', function () { input.setAttribute('data-val', o[0]); input.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); applyShowIf(formEl); }); input.appendChild(b); });
    }
    else if (f.type === 'range') {
      input = h('div', {}); var rng = h('input', { type: 'range', id: 'fld-' + f.key, 'data-key': f.key, min: f.min, max: f.max, value: f.default }); var out = h('b', { style: 'color:var(--accent);margin-left:8px' }, f.default + '%'); rng.addEventListener('input', function () { out.textContent = rng.value + '%'; }); var lab = h('div', { style: 'display:flex;align-items:center' }); lab.appendChild(rng); lab.appendChild(out); input.appendChild(lab); input._get = function () { return +rng.value; };
    }
    else if (f.type === 'signals') {
      input = h('div', { class: 'signals-widget', 'data-key': f.key }); var list = h('div', { class: 'sig-list', style: 'display:grid;gap:8px' }); input.appendChild(list); var add = h('button', { type: 'button', class: 'ghost-btn', style: 'margin-top:8px' }, '+ 신호 추가'); add.addEventListener('click', function () { addSignalRow(list); }); input.appendChild(add); addSignalRow(list, 'up'); addSignalRow(list, 'down');
      input._get = function () { var pos = [], neg = []; list.querySelectorAll('.sig-row').forEach(function (row) { var dir = row.querySelector('[data-dir]').getAttribute('data-dir'); var str = row.querySelector('[data-str]').value; (dir === 'up' ? pos : neg).push(str); }); return { positives: pos, negatives: neg }; };
    }
    else if (f.type === 'quiz') {
      var spec = FL.guidedData[f.spec];
      input = h('div', { class: 'quiz', 'data-key': f.key });
      spec.questions.forEach(function (q, qi) {
        var qd = h('div', { class: 'quiz-q', 'data-qi': qi, 'data-sel': '0' });
        qd.appendChild(h('div', { class: 'quiz-label' }, (qi + 1) + '. ' + q[0]));
        var opts = h('div', { class: 'quiz-opts' });
        q[1].forEach(function (o, oi) { var b = h('button', { type: 'button' }, o[0]); b.setAttribute('aria-pressed', oi === 0 ? 'true' : 'false'); b.addEventListener('click', function () { qd.setAttribute('data-sel', oi); opts.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); }); opts.appendChild(b); });
        qd.appendChild(opts); input.appendChild(qd);
      });
      input._get = function () { return Array.prototype.map.call(input.querySelectorAll('.quiz-q'), function (q) { return +q.getAttribute('data-sel'); }); };
    }
    wrap.appendChild(input);
    if (f.hint) wrap.appendChild(h('span', { class: 'hint' }, f.hint));
    return wrap;
  }
  function addSignalRow(list, dir) {
    dir = dir || 'up'; var row = h('div', { class: 'sig-row', style: 'display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:center' });
    var dsel = h('select', {}); [['up', '확률 ↑ 올리는 증거'], ['down', '확률 ↓ 내리는 증거']].forEach(function (o) { var op = h('option', { value: o[0] }, o[1]); if (o[0] === dir) op.selected = true; dsel.appendChild(op); });
    var dirHolder = h('input', { type: 'hidden', 'data-dir': dir }); dsel.addEventListener('change', function () { dirHolder.setAttribute('data-dir', dsel.value); });
    var ssel = h('select', { 'data-str': '1' }); [['약', '약한 증거'], ['중', '보통 증거'], ['강', '강한 증거']].forEach(function (o) { var op = h('option', { value: o[0] }, o[1]); if (o[0] === '중') op.selected = true; ssel.appendChild(op); });
    var del = h('button', { type: 'button', class: 'x-btn', style: 'position:static;width:32px;height:32px', title: '삭제' }, '×'); del.addEventListener('click', function () { row.remove(); });
    row.appendChild(dsel); row.appendChild(ssel); row.appendChild(del); row.appendChild(dirHolder); list.appendChild(row);
  }
  function applyShowIf(formEl) { formEl.querySelectorAll('[data-showif]').forEach(function (el) { var cond = el.getAttribute('data-showif').split('='); var ctrl = formEl.querySelector('[data-key="' + cond[0] + '"]'); var val = ctrl ? (ctrl.getAttribute('data-val') || ctrl.value) : null; el.hidden = (val !== cond[1]); }); }
  function collectValues(formEl, sys) {
    var v = {};
    sys.fields.forEach(function (f) { var el = formEl.querySelector('[data-key="' + f.key + '"]'); if (!el) return; if (f.type === 'seg') v[f.key] = el.getAttribute('data-val'); else if (el._get) v[f.key] = el._get(); else v[f.key] = el.value; });
    return v;
  }

  // ───────── 엔진 실행 ─────────
  var DECKS = {};
  function decks() { if (!DECKS.tarot) DECKS = { tarot: FL.tarotData.DECK, lenormand: FL.lenormandData.CARDS, runes: FL.runesData.RUNES, ogham: FL.oracleData.OGHAM, ifa: FL.oracleData.IFA, playing: FL.oracleData.PLAYING, oracle: FL.oracleData.ORACLE }; return DECKS; }

  function runSystem(sys, v) {
    var e = sys.engine;
    function bd(key) { return dateParts(v[key || 'birth']); }
    function need(d) { return d ? null : { error: '생년월일을 입력하세요.' }; }
    try {
      if (e === 'saju') { var d = bd(); if (!d) return need(); var t = timeParts(v.time); return { result: FL.saju.compute({ year: d.year, month: d.month, day: d.day, hour: t ? t.hour : 0, minute: t ? t.minute : 0, noHour: !t, tz: +v.tz, gender: v.gender, yajasi: v.yajasi === '1' }), input: v }; }
      if (e === 'iching') { var seed = FL.cards.makeSeed(); return { result: FL.iching.cast({ rng: FL.cards.mulberry32(seed) }), input: v }; }
      if (e === 'plum') { if (v.mode === 'num') { var n1 = parseInt(v.n1, 10), n2 = parseInt(v.n2, 10); if (!n1 || !n2) return { error: '두 수를 입력하세요.' }; return { result: FL.plum.castByNumbers(n1, n2), input: v }; } return { result: FL.plum.castByTime(new Date()), input: v }; }
      if (e === 'western') { var dw = bd(); if (!dw) return need(); var tw = timeParts(v.time); return { result: FL.western.compute({ year: dw.year, month: dw.month, day: dw.day, hour: tw ? tw.hour : null, minute: tw ? tw.minute : 0, tz: +v.tz }), input: v }; }
      if (e === 'moonsign') { var dm = bd(); if (!dm) return need(); var tm = timeParts(v.time); return { result: FL.western.moonSign({ year: dm.year, month: dm.month, day: dm.day, hour: tm ? tm.hour : null, minute: tm ? tm.minute : 0, tz: +v.tz }), input: v }; }
      if (e === 'ascendant') { var da = bd(); if (!da) return need(); var ta = timeParts(v.time); return { result: FL.western.ascendant({ year: da.year, month: da.month, day: da.day, hour: ta ? ta.hour : null, minute: ta ? ta.minute : 0, tz: +v.tz }), input: v }; }
      if (e === 'numerology') { var dn = bd(); if (!dn) return need(); return { result: FL.numerology.compute({ year: dn.year, month: dn.month, day: dn.day }), input: v }; }
      if (e === 'biorhythm') { var db = bd(); if (!db) return need(); return { result: FL.biorhythm.compute({ year: db.year, month: db.month, day: db.day, target: dateParts(v.target) }), input: v }; }
      if (e === 'zodiac') { var dz = bd(); if (!dz) return need(); return { result: FL.zodiac.compute({ year: dz.year, month: dz.month, day: dz.day }), input: v }; }
      if (e === 'foresight') { var sig = v.signals || { positives: [], negatives: [] }; return { result: FL.foresight.compute({ baseRatePct: v.base, positives: sig.positives, negatives: sig.negatives, controllability: v.controllability, event: v.event, horizon: v.horizon }), input: { event: v.event, horizon: v.horizon } }; }
      if (e === 'draw') { var dk = decks()[sys.deck]; var r = FL.cards.draw(dk, sys.count, { reversals: sys.reversals, canReverseKey: sys.canReverseKey }); return { result: r, input: v }; }
      if (e === 'vedic') { var dv = bd(); if (!dv) return need(); var tv = timeParts(v.time); return { result: FL.vedic.compute({ year: dv.year, month: dv.month, day: dv.day, hour: tv ? tv.hour : null, minute: tv ? tv.minute : 0, tz: +v.tz }), input: v }; }
      if (e === 'mayan') { var dy = bd(); if (!dy) return need(); return { result: FL.mayan.compute({ year: dy.year, month: dy.month, day: dy.day }), input: v }; }
      if (e === 'celtic') { var dc = bd(); if (!dc) return need(); return { result: FL.celtic.compute({ year: dc.year, month: dc.month, day: dc.day }), input: v }; }
      if (e === 'iljin') { var di = dateParts(v.date) || {}; return { result: FL.chrono.iljin(di), input: v }; }
      if (e === 'planetaryHours') { return { result: FL.chrono.planetaryHours(dateParts(v.date) || {}), input: v }; }
      if (e === 'solarterm') { return { result: FL.chrono.solarTerms(dateParts(v.date) || {}), input: v }; }
      if (e === 'sijin') { return { result: FL.chrono.sijin(), input: v }; }
      if (e === 'seongmyeong') { return { result: FL.naming.korean(v.name, +(v.surlen || 1)), input: v }; }
      if (e === 'jakmyeong') { return { result: FL.naming.jakmyeong(v.sur), input: v }; }
      if (e === 'nameNum') { return { result: FL.naming.latin(v.name), input: v }; }
      if (e === 'dangsaju' || e === 'gusung' || e === 'native' || e === 'thaiday' || e === 'samjae') { var dp = bd(); if (!dp) return need(); return { result: FL.profile[e]({ year: dp.year, month: dp.month, day: dp.day }), input: v }; }
      if (e === 'bloodtype') { return { result: FL.profile.bloodtype({ blood: v.blood }), input: v }; }
      if (e === 'ziwei') { var dzi = bd(); if (!dzi) return need(); var tzi = timeParts(v.time); return { result: FL.ziwei.compute({ year: dzi.year, month: dzi.month, day: dzi.day, hour: tzi ? tzi.hour : null }), input: v }; }
      if (e === 'toe') { var dto = bd(); if (!dto) return need(); return { result: FL.toe.compute({ year: dto.year, month: dto.month, day: dto.day }), input: v }; }
      if (e === 'geomancy') { return { result: FL.oracle.geomancy(), input: v }; }
      if (e === 'dice') { return { result: FL.oracle.dice2(), input: v }; }
      if (e === 'pendulum') { return { result: FL.oracle.yesno(sys.set), input: v }; }
      if (e === 'guided') { return { result: FL.guided.run(FL.guidedData[sys.spec], v.answers || []), input: v }; }
      if (e === 'relationship') { var a = bd('birth'), b = bd('birth2'); if (!a || !b) return { error: '두 사람의 생년월일을 모두 입력하세요.' }; return { result: FL.relationship.compute(sys.method, a, b), input: v }; }
      if (e === 'consult') { return { result: FL.consult.compute(sys.framework, v), input: v }; }
      if (e === 'montecarlo') { var mc = FL.foresight.monte(v); if (mc.error) return { error: mc.error }; return { result: mc, input: v }; }
      if (e === 'dream') { return { result: { hits: FL.dreamData.lookup(v.q || '') }, input: v }; }
    } catch (err) { return { error: '계산 중 오류가 발생했습니다: ' + err.message }; }
    return { error: '준비 중입니다.' };
  }

  // ───────── 모달 ─────────
  function openExperience(id) {
    var sys = S.byId[id]; if (!sys) { toast('준비 중인 체계입니다.'); return; }
    var modal = qs('#modal'), panel = qs('#panel'); panel.innerHTML = '';
    var head = h('div', { class: 'panel-head' });
    head.innerHTML = '<button class="x-btn" aria-label="닫기">×</button><div class="row">' + IC.render({ glyph: sys.glyph, grad: sys.grad }) + '<div><h2>' + sys.name + ' <span class="han">' + sys.han + '</span></h2></div></div><p class="blurb">' + sys.blurb + '</p>' + EV.badges(sys.grades);
    panel.appendChild(head); head.querySelector('.x-btn').addEventListener('click', closeModal);
    var bodyEl = h('div', { class: 'panel-body' });
    var formEl = h('form', { class: 'form' });
    (sys.fields || []).forEach(function (f) { formEl.appendChild(buildField(f, formEl)); });
    formEl.appendChild(h('button', { type: 'submit', class: 'btn primary run-btn' }, '✦ ' + sys.name + ' 체험하기'));
    bodyEl.appendChild(formEl);
    var resultEl = h('div', { class: 'result', style: 'margin-top:22px' });
    bodyEl.appendChild(resultEl); panel.appendChild(bodyEl); applyShowIf(formEl);

    formEl.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = collectValues(formEl, sys);
      var out = runSystem(sys, v);
      if (out.error) { toast(out.error); return; }
      if (out.result && out.result.error) { toast(out.result.error); return; }
      var reading = RD.render(sys.engine, out.result, out.input, sys);
      resultEl.innerHTML = reading.bodyHtml;
      var actions = h('div', { class: 'result-actions' });
      var again = h('button', { type: 'button', class: 'btn secondary' }, '↻ 다시 체험'); again.addEventListener('click', function () { resultEl.innerHTML = ''; formEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      var copy = h('button', { type: 'button', class: 'btn secondary' }, '⧉ 결과 복사'); copy.addEventListener('click', function () { copyResult(sys, resultEl); });
      actions.appendChild(again); actions.appendChild(copy); resultEl.appendChild(actions);
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); toast('결과가 준비되었습니다 ✦');
    });
    modal.hidden = false; document.body.style.overflow = 'hidden';
    try { if (history.pushState) history.pushState({ m: id }, '', '#' + id); } catch (e) {}
    setTimeout(function () { var fi = panel.querySelector('.panel-body input,.panel-body select,.panel-body textarea'); if (fi) fi.focus(); }, 120);
  }
  function copyResult(sys, resultEl) {
    var text = sys.name + ' (' + sys.han + ') — 미래학 체험관\n\n' + resultEl.innerText.replace(/\n{3,}/g, '\n\n') + '\n\n※ 근거등급은 체계마다 다릅니다. 외부 사건 적중(P)을 보장하지 않으며, 중대한 결정의 단독 근거로 쓰지 마세요.';
    try { navigator.clipboard.writeText(text).then(function () { toast('결과를 복사했습니다'); }, function () { fallbackCopy(text); }); } catch (e) { fallbackCopy(text); }
  }
  function fallbackCopy(text) { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('결과를 복사했습니다'); } catch (e) { toast('복사가 지원되지 않는 환경입니다'); } document.body.removeChild(ta); }
  function closeModal() { qs('#modal').hidden = true; document.body.style.overflow = ''; try { if (location.hash) history.pushState({}, '', location.pathname + location.search); } catch (e) {} }

  // ───────── 초기화 ─────────
  function init() {
    qs('#brand-logo').innerHTML = IC.logo;
    renderHub();
    var search = qs('#sys-search'); if (search) search.addEventListener('input', function () { applySearch(search.value); });
    qs('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    var tt = qs('#theme-toggle'); var saved = null; try { saved = localStorage.getItem('fl-theme'); } catch (e) {}
    if (saved) document.documentElement.setAttribute('data-theme', saved); syncTheme();
    tt.addEventListener('click', function () { var cur = document.documentElement.getAttribute('data-theme'); var isDark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; var next = isDark ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next); try { localStorage.setItem('fl-theme', next); } catch (e) {} syncTheme(); });
    function syncTheme() { var cur = document.documentElement.getAttribute('data-theme'); var isDark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; tt.textContent = isDark ? '☀ 밝게' : '☾ 어둡게'; }
    qs('#cta-start').addEventListener('click', function () { qs('#experiences').scrollIntoView({ behavior: 'smooth' }); });
    qs('#cta-saju').addEventListener('click', function () { openExperience('saju'); });
    window.addEventListener('popstate', function () { var id = (location.hash || '').replace('#', ''); if (id && S.byId[id]) openExperience(id); else closeModal(); });
    var initHash = (location.hash || '').replace('#', ''); if (initHash && S.byId[initHash]) setTimeout(function () { openExperience(initHash); }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

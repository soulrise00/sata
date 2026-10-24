const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/docs/experience.artifact.html', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(700);
  console.log('count:', await p.evaluate(() => window.FL && window.FL.systems && window.FL.systems.count));
  for (const id of ['vedic', 'mayan', 'foresight', 'mbti', 'compat-saju', 'consult', 'montecarlo', 'dream', 'ziwei', 'toe', 'geomancy', 'pendulum', 'gwansang', 'celtic', 'planetaryHours']) {
    const r = await p.evaluate((x) => { try { var el = document.querySelector('[data-id="' + x + '"]'); if (!el) return 'NOCARD'; el.click(); return 'ok'; } catch (e) { return 'ERR:' + e.message; } }, id);
    await p.waitForTimeout(50);
    await p.evaluate(() => { ['birth', 'birth2', 'time'].forEach(k => { var el = document.querySelector('#fld-' + k); if (el) el.value = k === 'time' ? '09:30' : (k === 'birth2' ? '1992-03-03' : '1990-06-15'); }); var q = document.querySelector('#fld-q'); if (q) q.value = '고민'; var ev = document.querySelector('#fld-event'); if (ev) ev.value = '목표 달성';['min', 'mode', 'max', 'target'].forEach((k, i) => { var el = document.querySelector('#fld-' + k); if (el) el.value = [200, 500, 1200, 600][i]; }); });
    await p.evaluate(() => { var btn = document.querySelector('.run-btn'); if (btn) btn.click(); });
    await p.waitForTimeout(130);
    const ok = await p.evaluate(() => { var r = document.querySelector('.panel-body .result'); return r && !!r.querySelector('.headline'); });
    console.log((ok ? '✓' : '✗'), id, r);
    await p.evaluate(() => { var x = document.querySelector('.x-btn'); if (x) x.click(); });
    await p.waitForTimeout(30);
  }
  console.log('errors:', errs.length ? JSON.stringify([...new Set(errs)]) : 'none');
  await b.close(); process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });

const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
  await page.goto('file://' + process.cwd() + '/index.html', { waitUntil: 'networkidle' });

  const cases = [
    { id:'saju', fill:{'#fld-birth':'1985-11-20','#fld-time':'14:10'}, expect:'.mingsik' },
    { id:'iching', fill:{'#fld-q':'이 프로젝트를 계속할까?'}, expect:'.hexline' },
    { id:'plum', fill:{'#fld-q':'결정 타이밍?'}, expect:'.two-hex' },
    { id:'western', fill:{'#fld-birth':'1992-03-28'}, expect:'.headline' },
    { id:'tarot', fill:{'#fld-q':'관계의 방향?'}, expect:'.card-row' },
    { id:'runes', fill:{'#fld-q':'지금 집중할 것?'}, expect:'.card-row' },
    { id:'lenormand', fill:{'#fld-q':'이직 흐름?'}, expect:'.card-row' },
    { id:'numerology', fill:{'#fld-birth':'1988-07-07'}, expect:'.headline' },
    { id:'biorhythm', fill:{'#fld-birth':'1990-01-01'}, expect:'.bars' },
    { id:'zodiac', fill:{'#fld-birth':'2000-09-09'}, expect:'.kv' },
    { id:'foresight', fill:{'#fld-event':'3개월 연속 목표매출 달성','#fld-horizon':'2027-06-30'}, expect:'.prob' },
  ];
  for (const c of cases) {
    await page.evaluate(id => { document.querySelector('[data-id="'+id+'"]').click(); }, c.id);
    await page.waitForTimeout(200);
    for (const sel in c.fill) { try { await page.fill(sel, c.fill[sel]); } catch(e){ errors.push(c.id+' fill '+sel+' FAIL: '+e.message);} }
    await page.click('.run-btn');
    await page.waitForTimeout(300);
    const ok = await page.evaluate(sel => !!document.querySelector('.panel-body '+sel), c.expect);
    console.log((ok?'✓':'✗')+' '+c.id+' → '+c.expect+(ok?'':'  !!! NOT FOUND'));
    // close
    await page.evaluate(() => document.querySelector('.x-btn').click());
    await page.waitForTimeout(150);
  }
  console.log('\nCONSOLE ERRORS:', errors.length ? JSON.stringify(errors,null,2) : 'none');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

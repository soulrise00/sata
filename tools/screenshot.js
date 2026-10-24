const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
  const url = 'file://' + process.cwd() + '/index.html';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'tools/shot-hub.png', fullPage: false });
  // scroll to grid
  await page.evaluate(() => document.querySelector('#experiences').scrollIntoView());
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tools/shot-grid.png' });
  // open saju
  await page.evaluate(() => window.FL && document.querySelector('[data-id="saju"]').click());
  await page.waitForTimeout(400);
  // fill saju form
  await page.fill('#fld-birth', '1990-06-15');
  await page.fill('#fld-time', '09:30');
  await page.fill('#fld-q', '올해 안에 이직을 실제로 실행하게 될까?');
  await page.screenshot({ path: 'tools/shot-saju-form.png' });
  await page.click('.run-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tools/shot-saju-result.png', fullPage: true });
  console.log('CONSOLE ERRORS:', errors.length ? JSON.stringify(errors, null, 2) : 'none');
  // check result rendered
  const hasMingsik = await page.evaluate(() => !!document.querySelector('.mingsik'));
  console.log('명식표 렌더:', hasMingsik);
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

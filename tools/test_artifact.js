const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1000,height:800} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+process.cwd()+'/docs/experience.artifact.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  const cards = await p.evaluate(()=>document.querySelectorAll('.sys-card.live').length);
  console.log('아티팩트 체험 카드 수:', cards, '(기대 11)');
  // run saju
  await p.evaluate(()=>document.querySelector('[data-id="saju"]').click());
  await p.waitForTimeout(200);
  await p.fill('#fld-birth','1988-02-29'); await p.fill('#fld-time','23:40');
  await p.click('.run-btn'); await p.waitForTimeout(300);
  const ok = await p.evaluate(()=>!!document.querySelector('.mingsik'));
  console.log('사주 결과 렌더:', ok);
  console.log('errors:', errs.length?JSON.stringify(errs):'none');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1100,height:900} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+process.cwd()+'/docs/final-encyclopedia.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  const nEntries = await p.evaluate(()=>document.querySelectorAll('.sys-entry').length);
  console.log('도감 엔트리 수:', nEntries, '(기대 41)');
  await p.evaluate(()=>document.querySelector('#atlas').scrollIntoView());
  await p.waitForTimeout(300);
  await p.screenshot({path:'tools/shot-doc-atlas.png'});
  await p.evaluate(()=>window.scrollTo(0,0));
  await p.waitForTimeout(200);
  await p.screenshot({path:'tools/shot-doc-top.png'});
  await b.close();
  console.log('errors:', errs.length?JSON.stringify(errs):'none');
})().catch(e=>{console.error(e);process.exit(1);});

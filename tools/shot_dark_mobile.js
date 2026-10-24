const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  // dark desktop
  const p1 = await b.newPage({ viewport:{width:1100,height:820}, colorScheme:'dark' });
  await p1.goto('file://'+process.cwd()+'/index.html',{waitUntil:'networkidle'});
  await p1.evaluate(()=>document.querySelector('#experiences').scrollIntoView());
  await p1.waitForTimeout(400);
  await p1.screenshot({path:'tools/shot-dark-grid.png'});
  // dark result
  await p1.evaluate(()=>document.querySelector('[data-id="foresight"]').click());
  await p1.waitForTimeout(200);
  await p1.fill('#fld-event','3개월 연속 목표매출 달성'); await p1.fill('#fld-horizon','2027-06-30');
  await p1.click('.run-btn'); await p1.waitForTimeout(400);
  await p1.screenshot({path:'tools/shot-dark-foresight.png'});
  // mobile light
  const p2 = await b.newPage({ viewport:{width:390,height:780} });
  await p2.goto('file://'+process.cwd()+'/index.html',{waitUntil:'networkidle'});
  await p2.waitForTimeout(400);
  const hscroll = await p2.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  console.log('mobile horizontal scroll?', hscroll);
  await p2.evaluate(()=>document.querySelector('#experiences').scrollIntoView());
  await p2.waitForTimeout(300);
  await p2.screenshot({path:'tools/shot-mobile-grid.png'});
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1000,height:800} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+process.cwd()+'/docs/experience.artifact.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  const n = await p.evaluate(()=>window.FL.systems.count);
  console.log('아티팩트 체계 수:', n);
  // run a few
  for (const id of ['saju','tarot','runes','vedic','mayan','foresight','mbti','compat-saju']) {
    await p.evaluate(x=>document.querySelector('[data-id="'+x+'"]').click(), id);
    await p.waitForTimeout(60);
    // fill common
    try{await p.fill('#fld-birth','1990-06-15');}catch(e){}
    try{await p.fill('#fld-birth2','1992-03-03');}catch(e){}
    try{await p.fill('#fld-time','09:30');}catch(e){}
    try{await p.fill('#fld-q','이직 고민');}catch(e){}
    try{await p.fill('#fld-event','매출 목표 달성');}catch(e){}
    await p.click('.run-btn'); await p.waitForTimeout(100);
    const ok = await p.evaluate(()=>{var r=document.querySelector('.panel-body .result');return r&&!!r.querySelector('.headline');});
    console.log((ok?'✓':'✗'), id);
    await p.evaluate(()=>document.querySelector('.x-btn').click()); await p.waitForTimeout(40);
  }
  console.log('errors:', errs.length?JSON.stringify([...new Set(errs)]):'none');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

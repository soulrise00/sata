const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1000,height:900} });
  const errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('file://'+process.cwd()+'/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  async function run(id, fills){
    await p.evaluate(x=>document.querySelector('[data-id="'+x+'"]').click(), id);
    await p.waitForTimeout(80);
    for (const k in fills) { try{ await p.fill('#fld-'+k, fills[k]); }catch(e){} }
    await p.click('.run-btn'); await p.waitForTimeout(120);
    const ok = await p.evaluate(()=>{var r=document.querySelector('.panel-body .result');return r && !!r.querySelector('.headline');});
    const txt = await p.evaluate(()=>{var r=document.querySelector('.panel-body .result .headline .big');return r?r.innerText:'';});
    console.log((ok?'✓':'✗'), id, '→', txt.slice(0,40));
    await p.evaluate(()=>document.querySelector('.x-btn').click()); await p.waitForTimeout(40);
  }
  await run('yut', {q:'올해 흐름?'});
  await run('namenum', {name:'GILDONG'});
  await run('gematria', {name:'DAVID'});
  await run('jakmyeong', {sur:'김'});
  await run('seongmyeong', {name:'홍길동'});
  await run('vedic', {birth:'1988-11-20', time:'14:10'});
  await run('mayan', {birth:'1995-03-09'});
  await run('montecarlo', {min:'200',mode:'500',max:'1200',target:'600'});
  await run('mbti', {});
  await run('samjae', {birth:'2001-05-05'});
  console.log('errors:', errors.length?JSON.stringify([...new Set(errors)]):'none');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

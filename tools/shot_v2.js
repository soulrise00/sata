const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1200,height:950} });
  await p.goto('file://'+process.cwd()+'/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  await p.evaluate(()=>document.querySelector('#experiences').scrollIntoView());
  await p.waitForTimeout(500);
  await p.screenshot({path:'tools/v2-grid.png'});
  async function cap(id, fills, name){
    await p.evaluate(x=>document.querySelector('[data-id="'+x+'"]').click(), id);
    await p.waitForTimeout(80);
    for (const k in fills){ try{await p.fill('#fld-'+k, fills[k]);}catch(e){} }
    await p.click('.run-btn'); await p.waitForTimeout(900);
    await p.screenshot({path:'tools/v2-'+name+'.png', fullPage:false});
    await p.evaluate(()=>document.querySelector('.x-btn').click()); await p.waitForTimeout(60);
  }
  await cap('saju', {birth:'1990-06-15', time:'09:30', q:'이직을 할지 고민'}, 'saju');
  await cap('tarot', {q:'이 관계를 어떻게 풀까'}, 'tarot');
  await cap('runes', {q:'지금 필요한 조언'}, 'runes');
  await cap('dice', {q:'추진해도 될까'}, 'dice');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});

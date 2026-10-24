const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1100,height:900} });
  const errors=[]; p.on('pageerror',e=>errors.push('PAGEERR: '+e.message)); p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('file://'+process.cwd()+'/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  const ids = await p.evaluate(()=> window.FL.systems.INTERACTIVE.map(s=>({id:s.id,engine:s.engine,fields:(s.fields||[]).map(f=>({key:f.key,type:f.type}))})) );
  console.log('총 체계 수:', ids.length);
  let pass=0, fail=[];
  for (const s of ids) {
    await p.evaluate(id=>{ history.replaceState({}, '', location.pathname); document.querySelector('[data-id="'+id+'"]').click(); }, s.id);
    await p.waitForTimeout(60);
    // fill fields
    for (const f of s.fields) {
      try {
        if (f.type==='date') await p.fill('#fld-'+f.key, f.key==='birth2'?'1992-03-03':'1990-06-15');
        else if (f.type==='time') await p.fill('#fld-'+f.key, '09:30');
        else if (f.type==='number') await p.fill('#fld-'+f.key, f.key==='min'?'200':f.key==='mode'?'500':f.key==='max'?'1200':f.key==='target'?'600':'7');
        else if (f.type==='text') await p.fill('#fld-'+f.key, f.key==='sur'?'김':'홍길동');
        else if (f.type==='textarea') await p.fill('#fld-'+f.key, '지금 이직을 할지 고민이다');
      } catch(e){}
    }
    try { await p.click('.run-btn'); } catch(e){ fail.push(s.id+' (no run btn)'); continue; }
    await p.waitForTimeout(90);
    const ok = await p.evaluate(()=>{ var r=document.querySelector('.panel-body .result'); return r && r.querySelector('.headline, .block'); });
    if (ok) pass++; else fail.push(s.id+' ['+s.engine+']');
    await p.evaluate(()=>{ var x=document.querySelector('.x-btn'); if(x) x.click(); });
    await p.waitForTimeout(30);
  }
  console.log('결과 렌더 성공:', pass+'/'+ids.length);
  if (fail.length) console.log('실패:', JSON.stringify(fail));
  console.log('콘솔 오류 수:', errors.length);
  if (errors.length) console.log(JSON.stringify([...new Set(errors)].slice(0,15), null, 2));
  await b.close();
})().catch(e=>{console.error('FATAL',e);process.exit(1);});

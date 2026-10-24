const astro = require('../assets/js/engines/astro.js');
const saju = require('../assets/js/engines/saju.js');

// 1) 일주 앵커 검증: 1900-01-01 = 甲戌日 (index 10)
const jdn = astro.julianDayNumber(1900,1,1);
const idx = ((jdn - 11) % 60 + 60) % 60;
console.log('1900-01-01 dayIdx =', idx, '→', saju.STEMS[idx%10]+saju.BRANCHES[idx%12], '(기대: 甲戌)');

// 2) 2000-01-01 = 戊午日 기대
const j2 = astro.julianDayNumber(2000,1,1);
const i2 = ((j2 - 11) % 60 + 60) % 60;
console.log('2000-01-01 dayIdx =', i2, '→', saju.STEMS[i2%10]+saju.BRANCHES[i2%12], '(기대: 戊午)');

// 3) 십신표 교차검증 (일간 甲, 대상 전체)
console.log('\n일간 甲 십신:', saju.STEMS.map(s=>s).map((s,i)=>saju.tenGod(0,i)).join(' '));
console.log('기대          : 비견 겁재 식신 상관 편재 정재 편관 정관 편인 정인');
console.log('일간 庚 십신:', saju.STEMS.map((s,i)=>saju.tenGod(6,i)).join(' '));
console.log('기대          : 편재 정재 편관 정관 편인 정인 비견 겁재 식신 상관');

// 4) 전체 명식 샘플: 1990-06-15 09:30 KST 남성
const r = saju.compute({year:1990,month:6,day:15,hour:9,minute:30,tz:9,gender:'male'});
const P = r.pillars;
const fmt = p => saju.STEMS[p.stem]+saju.BRANCHES[p.branch];
console.log('\n[1990-06-15 09:30 KST 男]');
console.log('태양황경:', r.pillars.sunLon.toFixed(2), '섹터:', P.sector);
console.log('연주', fmt(P.year), '월주', fmt(P.month), '일주', fmt(P.day), '시주', fmt(P.hour));
console.log('일간:', r.dayMaster.han, r.dayMaster.elem);
console.log('오행분포 목화토금수:', r.balance.map(x=>x.toFixed(1)).join(' '));
console.log('강약:', r.strength.label, '(ratio', r.strength.ratio.toFixed(2)+')');
console.log('조후:', r.climate.key);
console.log('용신관점:', r.useful.view, '후보:', r.useful.candidates.join('/'));
console.log('대운 시작나이:', r.luck.startAge, r.luck.forward?'순행':'역행');
console.log('대운:', r.luck.pillars.map(d=>d.age+':'+saju.STEMS[d.stem]+saju.BRANCHES[d.branch]).join(' '));
console.log('십신집계:', JSON.stringify(r.godCount));

// 5) 입춘 경계 테스트: 1984-02-04 vs 02-05 (甲子년 시작)
[[1984,2,3],[1984,2,5]].forEach(d=>{
  const rr = saju.compute({year:d[0],month:d[1],day:d[2],hour:12,tz:9,gender:'male'});
  console.log(`${d.join('-')} 연주=`+saju.STEMS[rr.pillars.year.stem]+saju.BRANCHES[rr.pillars.year.branch]+' 월주='+saju.STEMS[rr.pillars.month.stem]+saju.BRANCHES[rr.pillars.month.branch]);
});

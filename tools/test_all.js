const P='../assets/js/';
const hex=require(P+'data/hexagrams.js');
const iching=require(P+'engines/iching.js');
const plum=require(P+'engines/plum.js');
const western=require(P+'engines/western.js');
const numerology=require(P+'engines/numerology.js');
const biorhythm=require(P+'engines/biorhythm.js');
const zodiac=require(P+'engines/zodiac.js');
const foresight=require(P+'engines/foresight.js');
const tarotData=require(P+'data/tarot-data.js');
const runesData=require(P+'data/runes-data.js');
const lenData=require(P+'data/lenormand-data.js');
const cards=require(P+'engines/cards.js');

console.log('== 주역 괘 수:', hex.list.length, '(기대 64)');
// seeded cast
let seed=12345;
const rng=cards.mulberry32(seed);
const r=iching.cast({rng});
console.log('주역 본괘:', r.primary.num, r.primary.han, r.primary.ko, '| 동효:', r.movingIdx.map(i=>i+1).join(','), '| 변괘:', r.changed?r.changed.han:'-', '| 호괘:', r.nuclear.han);

console.log('\n== 매화역수 (수 7, 5):');
const pl=plum.castByNumbers(7,5);
console.log('본괘', pl.primary.han, pl.primary.ko,'| 동효',pl.moving,'| 체',pl.body,pl.bodyElem,'용',pl.use,pl.useElem,'|',pl.relation.key, pl.relation.tone);

console.log('\n== 서양점성 1995-08-10:');
const w=western.compute({year:1995,month:8,day:10,hour:14,tz:9});
console.log('태양황경',w.sunLon.toFixed(2),'→',w.sign.ko,w.sign.sym,w.sign.elem,w.sign.mode,'| 경계?',w.boundary);

console.log('\n== 수비학 1988-12-25:');
const nu=numerology.compute({year:1988,month:12,day:25,refYear:2026});
console.log('생명경로수',nu.lifePath,nu.lifeInfo.kw,'| 개인해',nu.personalYear,nu.personalYearInfo.kw);

console.log('\n== 생체리듬 (생 1990-03-15, 오늘 2026-10-24):');
const bio=biorhythm.compute({year:1990,month:3,day:15,target:{year:2026,month:10,day:24}});
console.log('출생후일수',bio.daysSinceBirth);
bio.cycles.forEach(c=>console.log('  ',c.ko,c.pct+'%',c.phase,c.rising?'↑':'↓'));

console.log('\n== 띠 2007-05-01:');
const z=zodiac.compute({year:2007,month:5,day:1});
console.log(z.animal,'('+z.han+'·'+z.elem+')','| 삼합',z.harmony.samhap.join('·'),'| 육합',z.harmony.yukhap,'| 충',z.clash);

console.log('\n== 현대 포사이트:');
const fs=foresight.compute({baseRatePct:30,positives:['중','강'],negatives:['약'],controllability:'mid'});
console.log('기준율',fs.baseRatePct+'% → 중심',fs.central+'% 범위',fs.band[0]+'~'+fs.band[1]+'%','(이동',fs.shift+')');

console.log('\n== 카드 덱 수:', 'tarot',tarotData.DECK.length,'(기대78)','runes',runesData.RUNES.length,'(기대24)','lenormand',lenData.CARDS.length,'(기대36)');
const td=cards.draw(tarotData.DECK,3,{reversals:true,seed:777});
console.log('타로 뽑기(seed',td.seed+'):', td.picks.map(p=>p.card.ko+(p.reversed?'(역)':'')).join(' / '));
const rd=cards.draw(runesData.RUNES,3,{reversals:true,seed:777,canReverseKey:'canReverse'});
console.log('룬 뽑기:', rd.picks.map(p=>p.card.name+(p.reversed?'(역)':'')).join(' / '));
const ld=cards.draw(lenData.CARDS,3,{seed:777});
console.log('르노르망 뽑기:', ld.picks.map(p=>p.card.ko).join(' / '));

// 재현성 검증: 같은 seed → 같은 뽑기
const td2=cards.draw(tarotData.DECK,3,{reversals:true,seed:777});
console.log('재현성(동일 seed 동일 결과?):', JSON.stringify(td.picks.map(p=>p.card.id))===JSON.stringify(td2.picks.map(p=>p.card.id)));

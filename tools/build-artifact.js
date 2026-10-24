/*
 * build-artifact.js — 다중 파일 플랫폼을 Artifact 규격 단일 HTML로 인라인.
 *  - <!doctype>/<html>/<head>/<body> 제거 (Artifact가 스켈레톤을 감쌈)
 *  - 최상단에 claude:viewport-fit-sides 메타 + <title> + 인라인 <style>(폰트는 @import)
 *  - 모든 엔진/데이터/앱 JS를 의존성 순서대로 인라인
 *  docs/*.html 문서는 별도 파일로 함께 퍼블리시(Artifact files)한다.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'assets/css/styles.css'), 'utf8');

// index.html에서 <body> 내부 추출
const bodyInner = indexHtml.split('<body>')[1].split('</body>')[0]
  .replace(/\n\s*<script src="[^"]+"><\/script>/g, '');  // 외부 스크립트 제거

// JS 의존성 순서 (index.html과 동일)
const jsFiles = [
  'assets/js/engines/astro.js',
  'assets/js/data/hexagrams.js',
  'assets/js/engines/saju.js',
  'assets/js/engines/iching.js',
  'assets/js/engines/plum.js',
  'assets/js/engines/western.js',
  'assets/js/engines/numerology.js',
  'assets/js/engines/biorhythm.js',
  'assets/js/engines/zodiac.js',
  'assets/js/engines/foresight.js',
  'assets/js/engines/cards.js',
  'assets/js/data/tarot-data.js',
  'assets/js/data/runes-data.js',
  'assets/js/data/lenormand-data.js',
  'assets/js/icons.js',
  'assets/js/evidence.js',
  'assets/js/systems.js',
  'assets/js/readings.js',
  'assets/js/app.js'
];
const js = jsFiles.map(f => '/* ===== ' + f + ' ===== */\n' + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');

const fontImport = "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@500;700;900&family=Spline+Sans+Mono:wght@500;700&display=swap');\n";

const out = [
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<title>미래학 체험관</title>',
  '<style>\n' + fontImport + css + '\n</style>',
  bodyInner.trim(),
  '<script>\n' + js + '\n</' + 'script>'
].join('\n');

const outPath = path.join(ROOT, 'docs/experience.artifact.html');
fs.writeFileSync(outPath, out);
console.log('built:', outPath, '(' + (out.length / 1024).toFixed(1) + ' KB)');

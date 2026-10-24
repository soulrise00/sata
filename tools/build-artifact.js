/*
 * build-artifact.js — 다중 파일 플랫폼을 Artifact 규격 단일 HTML로 인라인.
 * index.html의 <script src> 순서를 그대로 읽어 인라인하므로 파일이 늘어도 자동 동기화된다.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'assets/css/styles.css'), 'utf8');

// <body> 내부 추출 + 외부 스크립트 태그 제거
const bodyInner = indexHtml.split('<body>')[1].split('</body>')[0].replace(/\n\s*<script src="[^"]+"><\/script>/g, '');

// index.html의 스크립트 순서 그대로
const scriptSrcs = [];
indexHtml.replace(/<script src="([^"]+)"><\/script>/g, function (_, src) { scriptSrcs.push(src); return _; });
const js = scriptSrcs.map(function (src) { return '/* ===== ' + src + ' ===== */\n' + fs.readFileSync(path.join(ROOT, src), 'utf8'); }).join('\n');

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
console.log('built:', outPath, '(' + (out.length / 1024).toFixed(1) + ' KB, ' + scriptSrcs.length + ' scripts)');

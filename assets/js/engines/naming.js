/*
 * naming.js — 성명학(姓名學)
 *  · 한글 획수 기반 사격(四格: 원·형·이·정) + 81수리 길흉
 *  · 서양 피타고라스 네임 수비학(표현수·영혼수·인격수)
 * 학파마다 획수·수리 기준이 다름(필획법 채택, 참고용).
 */
(function (root) {
  'use strict';

  // 한글 자모 획수(필획법 기준의 통용 표)
  var CHO = { 'ㄱ': 2, 'ㄲ': 4, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 6, 'ㄹ': 5, 'ㅁ': 4, 'ㅂ': 4, 'ㅃ': 8, 'ㅅ': 2, 'ㅆ': 4, 'ㅇ': 1, 'ㅈ': 3, 'ㅉ': 6, 'ㅊ': 4, 'ㅋ': 3, 'ㅌ': 4, 'ㅍ': 4, 'ㅎ': 3 };
  var JUNG = { 'ㅏ': 2, 'ㅐ': 3, 'ㅑ': 3, 'ㅒ': 4, 'ㅓ': 2, 'ㅔ': 3, 'ㅕ': 3, 'ㅖ': 4, 'ㅗ': 2, 'ㅘ': 4, 'ㅙ': 5, 'ㅚ': 3, 'ㅛ': 3, 'ㅜ': 2, 'ㅝ': 4, 'ㅞ': 5, 'ㅟ': 3, 'ㅠ': 3, 'ㅡ': 1, 'ㅢ': 2, 'ㅣ': 1 };
  var JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  var CHO_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  var JUNG_LIST = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  function jongStrokes(j) {
    if (!j) return 0;
    // 겹받침은 구성 자모 합
    var map = { 'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'] };
    if (map[j]) return map[j].reduce(function (a, c) { return a + (CHO[c] || 0); }, 0);
    return CHO[j] || 0;
  }

  function charStrokes(ch) {
    var code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return null; // 한글 음절 아님
    var cho = Math.floor(code / 588), jung = Math.floor((code % 588) / 28), jong = code % 28;
    return (CHO[CHO_LIST[cho]] || 0) + (JUNG[JUNG_LIST[jung]] || 0) + jongStrokes(JONG[jong]);
  }

  // 81수리 길흉
  var GOOD = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81];
  var BAD = [2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 30, 34, 36, 40, 42, 43, 44, 46, 49, 50, 53, 54, 55, 56, 59, 60, 62, 64, 66, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80];
  var KW = { 1: '두령·시작', 3: '명예·지혜', 5: '성공·복덕', 6: '안정·덕망', 7: '독립·강건', 8: '근면·발전', 11: '흥가·신성', 13: '지모·명민', 15: '통솔·복수', 16: '덕망·재물', 17: '건창·용진', 21: '수령·자립', 23: '융창·공명', 24: '입신·축재', 25: '안강·영달', 29: '성공·지모', 31: '융창·지도', 32: '요행·순풍', 33: '승천·융성', 35: '태평·온건', 37: '인덕·권위', 39: '부영·장성', 41: '대공·덕망', 45: '순풍·대각', 47: '출세·전개', 48: '지모·공덕', 52: '선견·약진', 57: '노력·봉시', 61: '명리·번영', 63: '순성·길상', 65: '흥가·장수', 67: '통달·축재', 68: '명지·흥가', 81: '환원·극성' };
  function fortune(n) {
    var r = ((n - 1) % 81) + 1;
    var grade = GOOD.indexOf(r) >= 0 ? '길(吉)' : (BAD.indexOf(r) >= 0 ? '흉(凶)' : '반길(半吉)');
    return { n: n, reduced: r, grade: grade, kw: KW[r] || (grade === '길(吉)' ? '순조' : (grade === '흉(凶)' ? '변동·주의' : '기복')) };
  }

  // 한글 성명 → 사격
  function korean(name, surnameLen) {
    name = (name || '').replace(/\s/g, '');
    surnameLen = surnameLen || 1;
    var strokes = [];
    for (var i = 0; i < name.length; i++) { var s = charStrokes(name[i]); if (s == null) return { error: '한글 이름만 분석합니다.' }; strokes.push(s); }
    if (strokes.length < 2) return { error: '성과 이름을 2자 이상 입력하세요.' };
    var sur = strokes.slice(0, surnameLen), given = strokes.slice(surnameLen);
    var total = strokes.reduce(function (a, b) { return a + b; }, 0);
    var surSum = sur.reduce(function (a, b) { return a + b; }, 0);
    var givenSum = given.reduce(function (a, b) { return a + b; }, 0);
    // 사격(통용): 원격=이름합, 형격=성끝+이름첫, 이격=성첫+이름끝, 정격=총합
    var won = givenSum;
    var hyeong = sur[sur.length - 1] + given[0];
    var i_ = sur[0] + given[given.length - 1];
    var jeong = total;
    return {
      chars: name.split('').map(function (c, idx) { return { ch: c, s: strokes[idx] }; }),
      won: fortune(won), hyeong: fortune(hyeong), i: fortune(i_), jeong: fortune(jeong),
      total: total
    };
  }

  // 서양 피타고라스 네임 수비학
  var PYTH = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9, s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8 };
  var VOWELS = 'aeiou';
  function reduce(n) { while (n > 9 && n !== 11 && n !== 22 && n !== 33) { n = String(n).split('').reduce(function (a, b) { return a + +b; }, 0); } return n; }
  function latin(name) {
    var s = (name || '').toLowerCase().replace(/[^a-z]/g, '');
    if (s.length < 2) return { error: '영문 이름을 입력하세요.' };
    var exp = 0, soul = 0, pers = 0;
    for (var i = 0; i < s.length; i++) { var v = PYTH[s[i]]; exp += v; if (VOWELS.indexOf(s[i]) >= 0) soul += v; else pers += v; }
    return { expression: reduce(exp), soul: reduce(soul), personality: reduce(pers), raw: s };
  }

  // 작명 길한 획수 조합 추천
  function jakmyeong(surChar) {
    var surStroke = charStrokes((surChar || '').replace(/\s/g, '')[0]);
    if (surStroke == null) return { error: '성(姓)을 한글 한 글자로 입력하세요.' };
    var out = [];
    for (var a = 1; a <= 22 && out.length < 8; a++) {
      for (var b = 1; b <= 22; b++) {
        var won = fortune(a + b), hyeong = fortune(surStroke + a), i_ = fortune(surStroke + b), jeong = fortune(surStroke + a + b);
        var allGood = [won, hyeong, i_, jeong].every(function (f) { return f.grade.indexOf('길') === 0; });
        if (allGood) { out.push({ a: a, b: b, total: surStroke + a + b, grade: '사격 모두 吉' }); if (out.length >= 8) break; }
      }
    }
    return { sur: surChar, surStroke: surStroke, suggestions: out.slice(0, 6) };
  }

  var api = { korean: korean, latin: latin, charStrokes: charStrokes, fortune: fortune, jakmyeong: jakmyeong };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FL = root.FL || {}; root.FL.naming = api;
})(typeof window !== 'undefined' ? window : globalThis);

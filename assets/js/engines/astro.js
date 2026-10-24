/*
 * astro.js — 천문·역법 계산 (미래학연구소 Futures Lab)
 * -----------------------------------------------------------
 * 사주·택일·점성 계산의 공통 기반.
 *  - 율리우스일(Julian Day) 변환
 *  - 태양 황경(ecliptic longitude) 저정밀 계산 (Meeus, 오차 ~0.01°)
 *  - 24절기 중 월(月)을 가르는 12개 "절(節)" 경계 판정
 *
 * 설계 원칙(원전의 증거관을 그대로 따름):
 *   "역사적으로 사용되었다 / 절차를 재현할 수 있다 / 상담에 도움이 된다 /
 *    기준모형보다 잘 맞힌다" 는 서로 다른 사실이다.
 *   이 엔진은 그중 '재현성(R)' — 같은 입력에 같은 간지·괘를 만드는 것 — 만 보장한다.
 *   외부 사건 예측 타당도(P)는 보장하지 않으며 UI에서 증거등급으로 분리 표시한다.
 */
(function (root) {
  'use strict';
  var astro = {};

  var DEG = Math.PI / 180;

  // ── 율리우스일 (Fliegel–Van Flandern) ──────────────────────────
  // 정수 JDN: 해당 '민간 날짜'의 정오 기준 (일주 계산용)
  astro.julianDayNumber = function (y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var yy = y + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
      Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  };

  // 실수 JD (UT): 태양 위치 계산용. tz = 출생지 표준시차(시간, 예: 한국 +9)
  astro.julianDayUT = function (y, m, d, hour, minute, tz) {
    hour = hour || 0; minute = minute || 0; tz = tz || 0;
    var dayFraction = (hour + minute / 60 - tz) / 24; // UT로 환산
    // 날짜 경계가 넘어갈 수 있으므로 JDN 정오 기준에 보정
    return astro.julianDayNumber(y, m, d) - 0.5 + dayFraction;
  };

  // ── 태양 황경 (Meeus 25장 저정밀) ──────────────────────────────
  astro.sunLongitude = function (jd) {
    var T = (jd - 2451545.0) / 36525.0;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var Mr = M * DEG;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
      0.000289 * Math.sin(3 * Mr);
    var trueLong = L0 + C;
    // 겉보기 황경(장동·광행차 보정 생략, 날짜 수준 정확도에 충분)
    var lon = trueLong % 360;
    if (lon < 0) lon += 360;
    return lon;
  };

  // 황경 → 월지 섹터 인덱스.
  // 입춘(황경 315°)에서 寅월이 시작. 30°마다 다음 월.
  // 반환: 0 = 寅, 1 = 卯, ... 11 = 丑 (지지 인덱스로는 +2 offset)
  astro.solarMonthSector = function (lon) {
    var shifted = (lon - 315 + 360) % 360;
    return Math.floor(shifted / 30);
  };

  // 24절기 이름(절+중 교대). index 0 = 입춘(황경315), 1 = 우수(330)...
  astro.SOLAR_TERMS = [
    '입춘', '우수', '경칩', '춘분', '청명', '곡우', '입하', '소만',
    '망종', '하지', '소서', '대서', '입추', '처서', '백로', '추분',
    '한로', '상강', '입동', '소설', '대설', '동지', '소한', '대한'
  ];

  // 주어진 날짜의 '절입' 여부/다음 절까지 거리(일)를 근사.
  // 특정 황경 target(도)에 태양이 도달하는 시각(JD)을 이분법으로 탐색.
  astro.jdAtSunLongitude = function (targetLon, guessJd) {
    var lo = guessJd - 20, hi = guessJd + 20;
    function diff(jd) {
      var d = (astro.sunLongitude(jd) - targetLon + 540) % 360 - 180;
      return d;
    }
    // 부호가 바뀌는 구간을 찾아 이분법
    var prev = diff(lo), x = lo;
    for (var step = lo + 0.5; step <= hi; step += 0.5) {
      var cur = diff(step);
      if (prev <= 0 && cur >= 0 && Math.abs(cur - prev) < 180) {
        var a = step - 0.5, b = step;
        for (var i = 0; i < 40; i++) {
          var mid = (a + b) / 2;
          if (diff(mid) < 0) a = mid; else b = mid;
        }
        return (a + b) / 2;
      }
      prev = cur; x = step;
    }
    return null;
  };

  // ── 달 황경 (Meeus 47장 축약, 오차 ~0.3°) ─────────────────────
  astro.moonLongitude = function (jd) {
    var d = jd - 2451545.0;
    var Lp = 218.3164477 + 13.17639648 * d;
    var M = 357.5291 + 0.98560028 * d;       // 태양 평균근점이각
    var Mp = 134.9634 + 13.06499295 * d;     // 달 평균근점이각
    var D = 297.8502 + 12.19074912 * d;      // 평균이각
    var F = 93.2721 + 13.22935024 * d;       // 위도인수
    function s(x) { return Math.sin(x * DEG); }
    var lon = Lp
      + 6.289 * s(Mp)
      + 1.274 * s(2 * D - Mp)
      + 0.658 * s(2 * D)
      + 0.214 * s(2 * Mp)
      - 0.186 * s(M)
      - 0.114 * s(2 * F)
      + 0.059 * s(2 * D - 2 * Mp)
      + 0.057 * s(2 * D - M - Mp)
      + 0.053 * s(2 * D + Mp)
      + 0.046 * s(2 * D - M)
      - 0.041 * s(M - Mp);
    lon = lon % 360; if (lon < 0) lon += 360;
    return lon;
  };

  // 라히리 아야남샤(세차 보정) — 항성황도 변환용
  astro.ayanamsaLahiri = function (jd) {
    var yrs = (jd - 2451545.0) / 365.25;
    return 23.853 + yrs * (50.2388 / 3600);
  };
  astro.toSidereal = function (tropicalLon, jd) {
    var v = tropicalLon - astro.ayanamsaLahiri(jd);
    v = v % 360; if (v < 0) v += 360; return v;
  };

  // 태양 적위 → 낮 길이(시간) 근사. lat: 위도(도)
  astro.dayLength = function (jd, lat) {
    var lon = astro.sunLongitude(jd);
    var obliq = 23.4393 * DEG;
    var decl = Math.asin(Math.sin(obliq) * Math.sin(lon * DEG)); // rad
    var latr = (lat == null ? 37.5 : lat) * DEG;
    var cosH = -Math.tan(latr) * Math.tan(decl);
    cosH = Math.max(-1, Math.min(1, cosH));
    var H = Math.acos(cosH); // rad, 반일주각
    return 2 * H / Math.PI * 12; // 시간
  };

  // 요일별 지배행성(칼데안 순서). 0=일요일
  astro.DAY_RULERS = ['태양', '달', '화성', '수성', '목성', '금성', '토성'];
  astro.CHALDEAN = ['토성', '목성', '화성', '태양', '금성', '수성', '달']; // 느린→빠른

  // 환경 노출
  astro.DEG = DEG;
  if (typeof module !== 'undefined' && module.exports) module.exports = astro;
  root.FL = root.FL || {};
  root.FL.astro = astro;
})(typeof window !== 'undefined' ? window : globalThis);

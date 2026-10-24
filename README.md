# 미래학 체험관 · Futures Lab

**동서양 41개 전통 예측체계와 현대 검증형 미래예측을, 근거등급과 함께 정직하게 체험하는 플랫폼.**

사주·주역·타로·점성·룬·수비학에서 현대 전략 포사이트까지 — 아이콘을 누르면 **실제 계산**으로 결과가 나오고,
각 결과에는 그 체계가 무엇을 보장하고(재현성) 무엇은 보장하지 않는지(외부 예측력)를 **다섯 근거등급(H·R·P·C·X)** 으로 함께 표시합니다.
운세가 아니라, 질문을 다시 세우고 삶에 적용하는 도구로 씁니다.

> “역사적으로 사용되었다는 사실, 같은 절차를 재현할 수 있다는 사실, 상담에 도움이 된다는 사실,
> 외부 사건을 기준모형보다 잘 예측한다는 사실은 서로 다르다.”

## 바로 보기

- **플랫폼**: `index.html`
- **최종 윤문판 백과**: `docs/final-encyclopedia.html` · [Markdown](docs/미래예측_세계대백과_최종윤문판.md)
- **기획·개발서**: `docs/plan.html` · [Markdown](docs/기획개발서.md)

## 체험 가능한 체계 (11)

| 권역 | 체계 |
|---|---|
| 동아시아 | 사주명리 · 주역 · 매화역수 · 띠(십이지) |
| 서양·근동 | 서양 점성술 · 타로 · 룬 · 르노르망 · 수비학 |
| 현대·검증 | 생체리듬(참고) · 현대 미래예측(포사이트) |

전체 **41개 전통 + 현대 검증예측**은 플랫폼의 ‘도감’과 최종 윤문판 백과에 수록되어 있습니다.

## 기술

- **정적 웹앱(무백엔드)** · 바닐라 JS · 빌드 불필요 · 외부 의존성은 Google Fonts뿐
- 모든 계산이 **브라우저에서만** 수행 → 생년월일·질문 등 개인정보 비전송
- 사주 엔진은 Meeus 태양황경으로 절기 경계를 계산하는 **만세력급** 구현

```
assets/js/engines/   astro saju iching plum western zodiac cards numerology biorhythm foresight
assets/js/data/      hexagrams(64) tarot(78) runes(24) lenormand(36)
assets/js/           evidence systems icons readings app
docs/                final-encyclopedia.html plan.html + .md
tools/               엔진·UI 검증 스크립트(Node/Playwright)
```

## 로컬 실행

빌드가 필요 없습니다. 저장소를 받은 뒤 `index.html`을 브라우저로 열거나:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

엔진 검증:

```bash
node tools/test_saju.js   # 일주 앵커·십신표·입춘 경계 검증
node tools/test_all.js    # 전체 엔진 스모크 테스트
```

## 배포 (GitHub Pages)

이 저장소에는 `.github/workflows/pages.yml`이 포함되어 있습니다.
기본 브랜치에 병합되면, 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions** 를 한 번 지정한 뒤 자동 배포됩니다.

## 면책

이 플랫폼은 전통 예측체계를 문화유산으로 존중하되, 그 상징을 외부 사건 적중과 혼동하지 않습니다.
건강·법률·투자·생명 위험처럼 손실이 큰 결정에서는 어떤 전통 해석도 **단독 근거로 쓰지 않습니다.**

원전 《미래예측 세계 대백과》(기초개론 최종윤문 v6.3 외) 기반.

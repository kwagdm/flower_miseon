# 🌸 FlorAI - 오늘의 꽃 처방전

당신의 마음에 꼭 맞는 꽃 한 송이와 따뜻한 메시지를 선물하는 정서 지원 서비스입니다. 3~40대 여성 고객을 위한 화사하고 감성적인 웹 경험을 제공합니다.

## 🚀 개발 기록 (Commit History)

지금까지 쌓아온 프로젝트의 발자취입니다. 각 커밋은 하나의 완성된 기획 단위를 의미합니다.

### Phase 1: Foundation (기초 공사)
- **[Foundation] Initialize project structure and design system**
  - 프로젝트 폴더 구조(`src/scripts`, `src/styles`, `src/data`) 수립
  - `Warm White` & `Soft Pink` 기반의 초기 디자인 시스템 구축
  - 메인 `index.html` 및 기초 환경 설정 완료

### Phase 2: Core Features (핵심 기능)
- **[UI/UX] Implement 'Share Your Story' input screen**
  - 카드형 레이아웃의 사용자 고민 입력 화면 구현
  - 보라색 그라데이션 포인트 버튼 및 웹 최적화 여백 적용
  - "당신의 이야기는 보호됩니다" 등 신뢰감 있는 UI 요소 배치

- **[UI/UX] Improve waiting screen for 30-40s females with warm tone**
  - (피드백 반영) 다크 모드에서 화사한 웜 톤의 '감성 대기 화면'으로 전면 개편
  - 기계적 표현(AI 분석 등)을 배제하고 따뜻한 위로의 문구 적용
  - 꽃잎이 피어나는 `Bloom Animation` 로더 구현
  - 웹 브라우저 환경에 최적화된 레이아웃 및 여백 조정

- **[UI/UX] Implement magazine-style prescription result screen with serif typography**
  - 고해상도 꽃 이미지 배너를 활용한 매거진 스타일 결과 페이지 구현
  - 감성적인 세리프(Serif) 폰트와 편지 형태의 'From your Florist' 레이아웃 적용
  - 대기 화면에서 결과 화면으로 이어지는 5초간의 부드러운 전환 인터랙션 구현

### Phase 3: Intelligence & Data (두뇌 및 데이터)
- **[Data] Implement Phase 3-1: Foundation with RDA datasets and LocalStorage**
  - 농촌진흥청(RDA) 공공데이터 기반 10종의 꽃 지식 베이스 구축
  - 키워드 매칭 엔진을 통한 동적 꽃 처방 로직(v1.0) 구현
  - `LocalStorage`를 활용한 사용자 고민 및 최근 처방 내역 저장 기능 추가
  - (Humane Touch) 브랜드명을 `FlorAI`로 개편하고 UI 내 차가운 'AI' 용어 전면 제거

---
## 🛠 Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+)
- **Design Concept**: FlorAI Warm Mode (Pastel Pink, Warm White, Gold)
- **AI Matching**: Gemini 1.5 Pro Based Sentiment Analysis (Scheduled)

# 변경 로그 (Changelog)

이 파일은 vanilla-pinch-zoom 프로젝트의 모든 주목할 만한 변경사항을 문서화합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### 추가됨 (Added)

- NPM 배포를 위한 빌드 프로세스 설정
- Rollup을 사용한 개발/프로덕션 빌드 구성
- 기여 가이드라인 문서 추가
- 변경 로그 문서 추가

### 변경됨 (Changed)

- package.json 메타데이터 개선
- NPM 패키지 파일 구조 최적화

## [1.0.0] - 2024-01-XX

### 추가됨 (Added)

- Instagram과 같은 핀치 줌 기능 구현
- 터치 이벤트 처리 및 제스처 계산
- 이미지 스케일링 및 위치 제어
- 배경 오버레이 관리
- 크로스 브라우저 호환성 지원
- 설정 가능한 옵션들 (배경색, 최대/최소 스케일 등)
- 에러 처리 및 입력 검증
- 사용 예제 및 문서화
- MIT 라이선스

### 기술적 세부사항

- 바닐라 JavaScript로 구현 (외부 의존성 없음)
- 모듈식 아키텍처 (TouchHandler, ZoomController, OverlayManager)
- ES6+ 문법 사용
- UMD 형식으로 빌드하여 다양한 환경에서 사용 가능

---

## 버전 관리 규칙

- **Major (주 버전)**: 호환되지 않는 API 변경
- **Minor (부 버전)**: 하위 호환성을 유지하면서 기능 추가
- **Patch (패치 버전)**: 하위 호환성을 유지하면서 버그 수정

## 변경사항 분류

- **Added**: 새로운 기능
- **Changed**: 기존 기능의 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 수정

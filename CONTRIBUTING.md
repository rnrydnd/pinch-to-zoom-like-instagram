# 기여 가이드라인 (Contributing Guidelines)

vanilla-pinch-zoom 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 개발 환경 설정

1. 저장소를 포크하고 클론합니다:

```bash
git clone https://github.com/your-username/vanilla-pinch-zoom.git
cd vanilla-pinch-zoom
```

2. 의존성을 설치합니다:

```bash
npm install
```

3. 개발 모드로 빌드를 실행합니다:

```bash
npm run dev
```

## 개발 워크플로우

### 브랜치 전략

- `main`: 안정적인 릴리스 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

### 커밋 메시지 규칙

다음 형식을 따라주세요:

```
type(scope): description

[optional body]

[optional footer]
```

**타입:**

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 프로세스 또는 도구 변경

**예시:**

```
feat(touch-handler): add multi-touch gesture support
fix(zoom-controller): resolve scaling calculation issue
docs(readme): update installation instructions
```

## 코드 스타일

### JavaScript 스타일 가이드

- ES6+ 문법 사용
- 2칸 들여쓰기
- 세미콜론 사용
- 단일 따옴표 사용
- 의미있는 변수명과 함수명 사용

### 주석 작성

- 복잡한 로직에는 한국어 주석 추가
- JSDoc 형식으로 함수 문서화
- 예시:

```javascript
/**
 * 두 터치 포인트 사이의 거리를 계산합니다
 * @param {Touch} touch1 - 첫 번째 터치 포인트
 * @param {Touch} touch2 - 두 번째 터치 포인트
 * @returns {number} 두 포인트 사이의 거리
 */
function calculateDistance(touch1, touch2) {
  // 피타고라스 정리를 사용하여 거리 계산
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
```

## 테스트

### 테스트 실행

```bash
npm test
```

### 테스트 작성 가이드

- 각 기능에 대한 단위 테스트 작성
- 통합 테스트로 전체 워크플로우 검증
- 브라우저 호환성 테스트 포함

## 빌드 및 배포

### 로컬 빌드

```bash
npm run build
```

### 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] 빌드 오류 없음
- [ ] 문서 업데이트
- [ ] 버전 번호 업데이트
- [ ] CHANGELOG.md 업데이트

## Pull Request 가이드라인

### PR 생성 전

1. 최신 `develop` 브랜치와 동기화
2. 모든 테스트 통과 확인
3. 코드 스타일 검사 통과
4. 관련 문서 업데이트

### PR 템플릿

```markdown
## 변경 사항

- [ ] 새로운 기능
- [ ] 버그 수정
- [ ] 문서 업데이트
- [ ] 리팩토링
- [ ] 기타: ****\_\_\_****

## 설명

변경 사항에 대한 간단한 설명을 작성해주세요.

## 테스트

- [ ] 기존 테스트 모두 통과
- [ ] 새로운 테스트 추가 (해당하는 경우)
- [ ] 수동 테스트 완료

## 체크리스트

- [ ] 코드 스타일 가이드 준수
- [ ] 자체 코드 리뷰 완료
- [ ] 관련 문서 업데이트
```

## 이슈 리포팅

### 버그 리포트

다음 정보를 포함해주세요:

- 브라우저 및 버전
- 운영체제
- 재현 단계
- 예상 동작
- 실제 동작
- 스크린샷 (가능한 경우)

### 기능 요청

다음 정보를 포함해주세요:

- 기능에 대한 설명
- 사용 사례
- 예상되는 동작
- 대안 고려사항

## 질문 및 지원

- GitHub Issues를 통해 질문하거나 버그를 리포트해주세요
- 토론이 필요한 경우 GitHub Discussions를 활용해주세요

## 라이선스

이 프로젝트에 기여함으로써, 귀하의 기여가 MIT 라이선스 하에 라이선스됨에 동의합니다.

---

기여해 주셔서 감사합니다! 🎉

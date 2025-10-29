# 배포 가이드 (Deployment Guide)

이 문서는 vanilla-pinch-zoom 라이브러리를 NPM에 배포하는 방법을 설명합니다.

## 배포 전 체크리스트

### 1. 코드 품질 확인

- [ ] 모든 기능이 정상 작동하는지 확인
- [ ] 예제 파일들이 올바르게 작동하는지 테스트
- [ ] 브라우저 호환성 테스트 완료
- [ ] 코드 리뷰 완료

### 2. 문서 업데이트

- [ ] README.md 업데이트
- [ ] CHANGELOG.md에 새 버전 정보 추가
- [ ] API 문서 최신화
- [ ] 예제 코드 검증

### 3. 빌드 및 테스트

- [ ] 로컬 빌드 성공 확인
- [ ] 패키지 크기 확인 (npm pack --dry-run)
- [ ] 의존성 보안 검사 (npm audit)

### 4. 버전 관리

- [ ] 적절한 버전 번호 설정 (Semantic Versioning)
- [ ] Git 태그 준비
- [ ] 릴리스 노트 작성

## 배포 단계

### 1. 환경 준비

```bash
# NPM 로그인 확인
npm whoami

# 로그인이 필요한 경우
npm login
```

### 2. 최종 빌드

```bash
# 의존성 설치
npm install

# 빌드 디렉토리 정리
npm run clean

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la dist/
```

### 3. 패키지 검증

```bash
# 패키지 내용 미리보기
npm pack --dry-run

# 로컬 패키지 생성 및 테스트
npm pack
tar -tzf vanilla-pinch-zoom-*.tgz
```

### 4. 버전 업데이트

```bash
# 패치 버전 (버그 수정)
npm version patch

# 마이너 버전 (새 기능 추가)
npm version minor

# 메이저 버전 (호환성 변경)
npm version major
```

### 5. NPM 배포

```bash
# 배포 (자동으로 prepublishOnly 스크립트 실행됨)
npm publish

# 베타 버전 배포
npm publish --tag beta

# 특정 태그로 배포
npm publish --tag next
```

### 6. 배포 후 확인

```bash
# NPM에서 패키지 확인
npm view vanilla-pinch-zoom

# 설치 테스트
npm install vanilla-pinch-zoom
```

## 자동화된 배포 스크립트

### 전체 배포 프로세스

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 vanilla-pinch-zoom 배포 시작..."

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 보안 검사
echo "🔒 보안 검사 중..."
npm audit --audit-level moderate

# 3. 빌드
echo "🔨 빌드 중..."
npm run clean
npm run build

# 4. 패키지 검증
echo "✅ 패키지 검증 중..."
npm pack --dry-run

# 5. 버전 확인
echo "📋 현재 버전: $(npm version --json | jq -r '.\"vanilla-pinch-zoom\"')"
read -p "새 버전 타입을 입력하세요 (patch/minor/major): " version_type

# 6. 버전 업데이트
echo "🏷️ 버전 업데이트 중..."
npm version $version_type

# 7. 배포
echo "🚀 NPM에 배포 중..."
npm publish

echo "✨ 배포 완료!"
echo "📦 패키지: https://www.npmjs.com/package/vanilla-pinch-zoom"
```

### 사용법

```bash
# 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

## 배포 환경별 설정

### 개발 환경 (Development)

```bash
# 개발용 빌드
npm run dev

# 로컬 테스트
npm link
cd ../test-project
npm link vanilla-pinch-zoom
```

### 스테이징 환경 (Staging)

```bash
# 베타 버전으로 배포
npm version prerelease --preid=beta
npm publish --tag beta

# 베타 버전 설치 테스트
npm install vanilla-pinch-zoom@beta
```

### 프로덕션 환경 (Production)

```bash
# 안정 버전 배포
npm version patch  # 또는 minor, major
npm publish

# 최신 태그 확인
npm dist-tag ls vanilla-pinch-zoom
```

## 롤백 절차

### 버전 롤백

```bash
# 특정 버전을 latest로 설정
npm dist-tag add vanilla-pinch-zoom@1.0.0 latest

# 문제가 있는 버전 제거 (24시간 이내에만 가능)
npm unpublish vanilla-pinch-zoom@1.0.1
```

### 긴급 수정 (Hotfix)

```bash
# 이전 안정 버전에서 브랜치 생성
git checkout v1.0.0
git checkout -b hotfix/critical-fix

# 수정 작업 후
git commit -m "fix: critical security issue"
git tag v1.0.1
git push origin v1.0.1

# 핫픽스 배포
npm version patch
npm publish
```

## 모니터링 및 분석

### NPM 통계 확인

```bash
# 다운로드 통계
npm view vanilla-pinch-zoom

# 의존성 트리
npm ls vanilla-pinch-zoom
```

### 사용자 피드백 모니터링

- GitHub Issues 확인
- NPM 패키지 페이지 모니터링
- 다운로드 통계 분석
- 사용자 리뷰 및 평점 확인

## 문제 해결

### 일반적인 배포 문제

#### 1. 권한 오류

```bash
# NPM 로그인 상태 확인
npm whoami

# 재로그인
npm logout
npm login
```

#### 2. 빌드 실패

```bash
# 캐시 정리
npm cache clean --force

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. 버전 충돌

```bash
# 원격 버전 확인
npm view vanilla-pinch-zoom versions --json

# 로컬 버전 확인
npm version --json
```

#### 4. 패키지 크기 문제

```bash
# 패키지 크기 분석
npm pack --dry-run

# 불필요한 파일 제외 (.npmignore 수정)
echo "*.test.js" >> .npmignore
```

## 보안 고려사항

### 1. 의존성 보안

```bash
# 정기적인 보안 검사
npm audit

# 자동 수정
npm audit fix
```

### 2. 패키지 무결성

```bash
# 체크섬 확인
npm pack
shasum -a 256 vanilla-pinch-zoom-*.tgz
```

### 3. 2FA 설정

```bash
# 2단계 인증 활성화
npm profile enable-2fa auth-and-writes
```

## 지속적 통합 (CI/CD)

### GitHub Actions 예제

```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"

      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

이 가이드를 따라 안전하고 효율적인 배포를 진행하세요! 🚀

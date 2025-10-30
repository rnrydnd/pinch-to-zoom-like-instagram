# 🔍 PinchZoom

Instagram과 같은 핀치 줌 기능을 제공하는 바닐라 JavaScript 라이브러리

[![npm version](https://badge.fury.io/js/pinch-zoom-like-instagram.svg)](https://badge.fury.io/js/pinch-zoom-like-instagram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | **한국어**

## ✨ 주요 기능

- 📱 모바일 터치 제스처 지원
- ⚡ 경량화 (약 15KB, 의존성 없음)
- 🎨 커스터마이징 가능한 옵션
- 🌐 크로스 브라우저 지원

## 🚀 빠른 시작

### 설치

```bash
npm install pinch-zoom-like-instagram
```

### 기본 사용법

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <img id="my-image" src="image.jpg" alt="확대 가능한 이미지" />

    <script type="module">
      import { PinchZoom } from "pinch-zoom-like-instagram";

      // 기본 설정으로 초기화
      const pinchZoom = new PinchZoom("#my-image");
    </script>
  </body>
</html>
```

## 📖 사용 방법

### ES6 모듈

```javascript
import { PinchZoom } from "pinch-zoom-like-instagram";

const pinchZoom = new PinchZoom("#my-image", {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  maxScale: 4,
});
```

### 브라우저 직접 사용

```html
<script src="dist/pinch-zoom-like-instagram.min.js"></script>
<script>
  const pinchZoom = new PinchZoom("#my-image");
</script>
```

## ⚙️ 설정 옵션

| 옵션                 | 타입     | 기본값                       | 설명                     |
| -------------------- | -------- | ---------------------------- | ------------------------ |
| `backgroundColor`    | `string` | `'rgba(255, 255, 255, 0.8)'` | 줌 시 배경 오버레이 색상 |
| `maxScale`           | `number` | `5`                          | 최대 확대 배율           |
| `minScale`           | `number` | `1`                          | 최소 확대 배율           |
| `transitionDuration` | `string` | `'0.3s'`                     | 애니메이션 전환 시간     |
| `zIndex`             | `number` | `1000`                       | 오버레이의 z-index 값    |

### 설정 예제

```javascript
const pinchZoom = new PinchZoom("#image", {
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  maxScale: 6,
  minScale: 0.5,
});
```

## 📚 API

### 생성자

```javascript
new PinchZoom(target, options);
```

### 주요 메서드

```javascript
pinchZoom.destroy(); // 인스턴스 제거
pinchZoom.updateOptions(newOptions); // 옵션 업데이트
```

## 🌐 브라우저 지원

- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- iOS Safari 12+, Android Chrome 60+
- Internet Explorer 11 (제한적 지원)

## 🛠️ 고급 사용법

### 동적 이미지 처리

```javascript
// 이미지 로드 후 PinchZoom 적용
img.onload = () => {
  new PinchZoom(img, options);
};
```

### 메모리 관리

```javascript
// 인스턴스 정리
pinchZoom.destroy();
```

## 📝 예제

### React 컴포넌트

```jsx
import React, { useEffect, useRef } from "react";
import { PinchZoom } from "pinch-zoom-like-instagram";

const ZoomableImage = ({ src, alt }) => {
  const imgRef = useRef(null);
  const pinchZoomRef = useRef(null);

  useEffect(() => {
    if (imgRef.current) {
      pinchZoomRef.current = new PinchZoom(imgRef.current);
    }
    return () => pinchZoomRef.current?.destroy();
  }, []);

  return <img ref={imgRef} src={src} alt={alt} />;
};
```

### Vue 컴포넌트

```vue
<template>
  <img ref="imageRef" :src="src" :alt="alt" />
</template>

<script>
import { PinchZoom } from "pinch-zoom-like-instagram";

export default {
  mounted() {
    this.pinchZoom = new PinchZoom(this.$refs.imageRef);
  },
  beforeDestroy() {
    this.pinchZoom?.destroy();
  },
};
</script>
```

## 📄 라이선스

MIT 라이선스

## 📞 지원

- 🐛 [GitHub Issues](https://github.com/rnrydnd/pinch-to-zoom-like-instagram/issues)
- 📧 mesquaker@gmail.com

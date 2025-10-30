# 🔍 PinchZoom

Instagram-like pinch zoom functionality for vanilla JavaScript

[![npm version](https://badge.fury.io/js/pinch-zoom-like-instagram.svg)](https://badge.fury.io/js/pinch-zoom-like-instagram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [한국어](README.ko.md)

## ✨ Features

- 📱 Mobile touch gesture support
- ⚡ Lightweight (~15KB, zero dependencies)
- 🎨 Customizable options
- 🌐 Cross-browser compatibility

## 🚀 Quick Start

### Installation

```bash
npm install pinch-zoom-like-instagram
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <img id="my-image" src="image.jpg" alt="Zoomable image" />

    <script type="module">
      import { PinchZoom } from "pinch-zoom-like-instagram";

      // Initialize with default settings
      const pinchZoom = new PinchZoom("#my-image");
    </script>
  </body>
</html>
```

## 📖 Usage

### ES6 Module

```javascript
import { PinchZoom } from "pinch-zoom-like-instagram";

const pinchZoom = new PinchZoom("#my-image", {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  maxScale: 4,
});
```

### Browser Direct Usage

```html
<script src="dist/pinch-zoom-like-instagram.min.js"></script>
<script>
  const pinchZoom = new PinchZoom("#my-image");
</script>
```

## ⚙️ Configuration Options

| Option               | Type     | Default                      | Description                   |
| -------------------- | -------- | ---------------------------- | ----------------------------- |
| `backgroundColor`    | `string` | `'rgba(255, 255, 255, 0.8)'` | Background overlay color      |
| `maxScale`           | `number` | `5`                          | Maximum zoom scale            |
| `minScale`           | `number` | `1`                          | Minimum zoom scale            |
| `transitionDuration` | `string` | `'0.3s'`                     | Animation transition duration |
| `zIndex`             | `number` | `1000`                       | Overlay z-index value         |

### Configuration Example

```javascript
const pinchZoom = new PinchZoom("#image", {
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  maxScale: 6,
  minScale: 0.5,
});
```

## 📚 API

### Constructor

```javascript
new PinchZoom(target, options);
```

### Main Methods

```javascript
pinchZoom.destroy(); // Remove instance
pinchZoom.updateOptions(newOptions); // Update options
```

## 🌐 Browser Support

- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- iOS Safari 12+, Android Chrome 60+
- Internet Explorer 11 (limited support)

## 🛠️ Advanced Usage

### Dynamic Image Handling

```javascript
// Apply PinchZoom after image loads
img.onload = () => {
  new PinchZoom(img, options);
};
```

### Memory Management

```javascript
// Clean up instance
pinchZoom.destroy();
```

## 📝 Examples

### React Component

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

### Vue Component

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

## 📄 License

MIT License

## 📞 Support

- 🐛 [GitHub Issues](https://github.com/rnrydnd/pinch-to-zoom-like-instagram/issues)
- 📧 mesquaker@gmail.com

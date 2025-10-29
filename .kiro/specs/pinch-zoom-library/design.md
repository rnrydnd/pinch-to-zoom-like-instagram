# Design Document

## Overview

The PinchZoom library will be a lightweight, vanilla JavaScript solution that provides Instagram-like pinch zoom functionality for images. The library will feature a clean API, configurable options, and cross-browser compatibility without external dependencies.

## Architecture

### Core Components

1. **PinchZoom Class**: Main class that handles initialization and configuration
2. **TouchHandler**: Manages touch event detection and gesture calculations
3. **ZoomController**: Controls image scaling, positioning, and animations
4. **OverlayManager**: Manages the background overlay appearance and behavior
5. **Utils**: Helper functions for DOM manipulation and calculations

### Module Structure

```
src/
├── index.js              # Main entry point and PinchZoom class
├── touch-handler.js      # Touch event management
├── zoom-controller.js    # Zoom logic and animations
├── overlay-manager.js    # Overlay management
└── utils.js             # Utility functions
```

## Components and Interfaces

### PinchZoom Class

```javascript
class PinchZoom {
  constructor(target, options = {})
  init()
  destroy()
  updateOptions(newOptions)
}
```

**Configuration Options:**

- `backgroundColor`: String (default: 'rgba(255, 255, 255, 0.8)')
- `maxScale`: Number (default: 5)
- `minScale`: Number (default: 1)
- `transitionDuration`: String (default: '0.3s')
- `zIndex`: Number (default: 1000)

### TouchHandler Interface

```javascript
class TouchHandler {
  constructor(element, callbacks)
  bindEvents()
  unbindEvents()
  handleTouchStart(event)
  handleTouchMove(event)
  handleTouchEnd(event)
}
```

### ZoomController Interface

```javascript
class ZoomController {
  constructor(element, options)
  applyTransform(scale, translateX, translateY)
  resetTransform()
  calculateScale(initialDistance, currentDistance)
  calculateMidpoint(touch1, touch2)
}
```

### OverlayManager Interface

```javascript
class OverlayManager {
  constructor(options)
  createOverlay()
  updateOverlay(opacity)
  removeOverlay()
}
```

## Data Models

### Touch State

```javascript
const touchState = {
  isActive: false,
  initialDistance: 0,
  currentScale: 1,
  initialPosition: { x: 0, y: 0 },
  currentPosition: { x: 0, y: 0 },
  touches: [],
};
```

### Configuration Schema

```javascript
const defaultConfig = {
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  maxScale: 5,
  minScale: 1,
  transitionDuration: "0.3s",
  zIndex: 1000,
};
```

## API Design

### Primary API

```javascript
// Constructor approach
const pinchZoom = new PinchZoom(".my-image", {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  maxScale: 3,
});

// Factory function approach (alternative)
const pinchZoom = createPinchZoom(".my-image", options);

// Multiple images
const pinchZoom = new PinchZoom(".gallery img", options);

// Direct DOM element
const img = document.querySelector("#my-image");
const pinchZoom = new PinchZoom(img, options);
```

### Method Chaining Support

```javascript
new PinchZoom(".image").updateOptions({ backgroundColor: "red" }).init();
```

## Error Handling

### Input Validation

1. **Invalid Selectors**: Log warning and skip invalid elements
2. **Non-image Elements**: Log warning and skip non-img elements
3. **Missing Elements**: Log warning when no elements found
4. **Invalid Options**: Use defaults for invalid option values

### Runtime Error Handling

1. **Touch Event Errors**: Gracefully handle touch event failures
2. **Transform Errors**: Fallback to basic scaling if advanced transforms fail
3. **Overlay Creation Errors**: Continue without overlay if creation fails

### Error Recovery

```javascript
try {
  // Apply pinch zoom functionality
} catch (error) {
  console.warn("PinchZoom: Failed to initialize on element", element, error);
  // Continue with next element
}
```

## Cross-Browser Compatibility

### Touch Event Support

- **Modern Browsers**: Use standard Touch Events API
- **Fallback**: Detect and handle pointer events for broader support
- **Desktop**: Optional mouse wheel zoom support

### CSS Transform Support

- **Vendor Prefixes**: Include -webkit-, -moz-, -ms- prefixes
- **Feature Detection**: Check for transform support before applying
- **Fallback**: Basic positioning for unsupported browsers

### Event Handling

```javascript
// Cross-browser event binding
const addEvent = (element, event, handler) => {
  if (element.addEventListener) {
    element.addEventListener(event, handler, { passive: false });
  } else if (element.attachEvent) {
    element.attachEvent("on" + event, handler);
  }
};
```

## Performance Considerations

### Event Optimization

- Use passive event listeners where possible
- Throttle touchmove events to prevent excessive calculations
- Remove event listeners on destroy to prevent memory leaks

### DOM Manipulation

- Minimize DOM queries by caching elements
- Use requestAnimationFrame for smooth animations
- Batch style changes to reduce reflows

### Memory Management

- Clean up event listeners on destroy
- Remove overlay elements when not needed
- Avoid creating unnecessary closures

## Testing Strategy

### Unit Testing Focus Areas

1. **Configuration Validation**: Test option parsing and defaults
2. **Touch Calculations**: Test distance and midpoint calculations
3. **Scale Boundaries**: Test min/max scale enforcement
4. **Error Handling**: Test graceful failure scenarios

### Integration Testing

1. **DOM Interaction**: Test element selection and manipulation
2. **Event Handling**: Test touch event processing
3. **Cross-browser**: Test on different browsers and devices

### Manual Testing

1. **Touch Devices**: Test on various mobile devices and tablets
2. **Desktop**: Test mouse interaction (if implemented)
3. **Edge Cases**: Test with different image sizes and positions

## Build and Distribution

### Build Process

1. **Bundling**: Use Rollup or Webpack for module bundling
2. **Minification**: Provide both development and minified versions
3. **Source Maps**: Include source maps for debugging

### NPM Package Structure

```
package/
├── dist/
│   ├── pinch-zoom.js         # Development version
│   ├── pinch-zoom.min.js     # Minified version
│   └── pinch-zoom.min.js.map # Source map
├── src/                      # Source files
├── examples/                 # Example implementations
├── package.json
├── README.md
└── LICENSE
```

### Package.json Configuration

```json
{
  "name": "vanilla-pinch-zoom",
  "main": "dist/pinch-zoom.js",
  "module": "src/index.js",
  "browser": "dist/pinch-zoom.min.js",
  "files": ["dist", "src", "examples"],
  "keywords": ["pinch", "zoom", "touch", "mobile", "vanilla", "javascript"]
}
```

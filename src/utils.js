/**
 * Utility functions - Helper functions for DOM manipulation and calculations
 */

/**
 * Calculate distance between two touch points
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {number} Distance between two points
 */
export function getDistance(touch1, touch2) {
  return Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
  );
}

/**
 * Calculate midpoint of two touch points
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {Object} Midpoint coordinates {x, y}
 */
export function getMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

/**
 * Add cross-browser event listener
 * @param {Element} element - Element to add event to
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object|boolean} options - Event options (object or useCapture boolean)
 */
export function addEvent(element, event, handler, options = {}) {
  if (!element || !event || !handler) {
    return false;
  }

  try {
    if (element.addEventListener) {
      // Modern browsers
      element.addEventListener(event, handler, options);
    } else if (element.attachEvent) {
      // IE8 and below
      element.attachEvent("on" + event, handler);
    } else {
      // Very old browser fallback
      element["on" + event] = handler;
    }
    return true;
  } catch (error) {
    console.warn("Failed to add event listener:", error);
    return false;
  }
}

/**
 * Remove cross-browser event listener
 * @param {Element} element - Element to remove event from
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object|boolean} options - Event options (same as addEventListener)
 */
export function removeEvent(element, event, handler, options = {}) {
  if (!element || !event || !handler) {
    return false;
  }

  try {
    if (element.removeEventListener) {
      // Modern browsers
      element.removeEventListener(event, handler, options);
    } else if (element.detachEvent) {
      // IE8 and below
      element.detachEvent("on" + event, handler);
    } else {
      // Very old browser fallback
      element["on" + event] = null;
    }
    return true;
  } catch (error) {
    console.warn("Failed to remove event listener:", error);
    return false;
  }
}

/**
 * Normalize event object (cross-browser compatibility)
 * @param {Event} event - Original event object
 * @returns {Event} Normalized event object
 */
export function normalizeEvent(event) {
  // Use window.event in IE
  event = event || window.event;

  if (!event) {
    return null;
  }

  // Add preventDefault method (IE compatibility)
  if (!event.preventDefault) {
    event.preventDefault = function () {
      event.returnValue = false;
    };
  }

  // Add stopPropagation method (IE compatibility)
  if (!event.stopPropagation) {
    event.stopPropagation = function () {
      event.cancelBubble = true;
    };
  }

  // Normalize target property (IE uses srcElement)
  if (!event.target) {
    event.target = event.srcElement;
  }

  return event;
}

/**
 * Check if element is an image
 * @param {Element} element - Element to check
 * @returns {boolean} Whether element is an image
 */
export function isImageElement(element) {
  return element && element.tagName && element.tagName.toLowerCase() === "img";
}

/**
 * Convert selector or DOM element to array
 * @param {string|Element|NodeList} target - Selector, DOM element, or NodeList
 * @returns {Element[]} Array of DOM elements
 */
export function getElements(target) {
  if (typeof target === "string") {
    return Array.from(document.querySelectorAll(target));
  } else if (target instanceof Element) {
    return [target];
  } else if (target instanceof NodeList) {
    return Array.from(target);
  }
  return [];
}

/**
 * Clamp value between minimum and maximum
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check CSS transform support and return supported property
 * @returns {Object} CSS transform support info {supported, property, prefixed}
 */
export function getTransformSupport() {
  const testElement = document.createElement("div");
  const transformProperties = [
    { name: "transform", prefixed: false },
    { name: "webkitTransform", prefixed: true },
    { name: "mozTransform", prefixed: true },
    { name: "msTransform", prefixed: true },
    { name: "oTransform", prefixed: true },
  ];

  for (const prop of transformProperties) {
    if (testElement.style[prop.name] !== undefined) {
      return {
        supported: true,
        property: prop.name,
        prefixed: prop.prefixed,
      };
    }
  }

  return {
    supported: false,
    property: null,
    prefixed: false,
  };
}

/**
 * Check CSS transform support (backward compatibility)
 * @returns {boolean} Whether CSS transforms are supported
 */
export function supportsTransform() {
  return getTransformSupport().supported;
}

/**
 * Apply cross-browser CSS transform
 * @param {Element} element - Element to apply transform to
 * @param {string} transformValue - Transform value (e.g., "scale(2) translate(10px, 20px)")
 */
export function applyTransform(element, transformValue) {
  const support = getTransformSupport();

  if (support.supported) {
    element.style[support.property] = transformValue;

    // Apply additional vendor prefixes (for safety)
    if (element.style.webkitTransform !== undefined) {
      element.style.webkitTransform = transformValue;
    }
    if (element.style.mozTransform !== undefined) {
      element.style.mozTransform = transformValue;
    }
    if (element.style.msTransform !== undefined) {
      element.style.msTransform = transformValue;
    }
    if (element.style.oTransform !== undefined) {
      element.style.oTransform = transformValue;
    }
  }
}

/**
 * Apply cross-browser CSS transition
 * @param {Element} element - Element to apply transition to
 * @param {string} transitionValue - Transition value
 */
export function applyTransition(element, transitionValue) {
  const transitionProperties = [
    "transition",
    "webkitTransition",
    "mozTransition",
    "msTransition",
    "oTransition",
  ];

  transitionProperties.forEach((property) => {
    if (element.style[property] !== undefined) {
      element.style[property] = transitionValue;
    }
  });
}

/**
 * Return touch event support information
 * @returns {Object} Touch event support information
 */
export function getTouchSupport() {
  const hasTouch = "ontouchstart" in window;
  const hasPointer = "onpointerdown" in window;
  const hasMSPointer = "onmspointerdown" in window;
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const msMaxTouchPoints = navigator.msMaxTouchPoints || 0;

  return {
    touch: hasTouch,
    pointer: hasPointer,
    msPointer: hasMSPointer,
    maxTouchPoints: Math.max(maxTouchPoints, msMaxTouchPoints),
    supported: hasTouch || hasPointer || hasMSPointer || maxTouchPoints > 0,
    preferredEvents: hasTouch
      ? "touch"
      : hasPointer
      ? "pointer"
      : hasMSPointer
      ? "mspointer"
      : "none",
  };
}

/**
 * Check touch event support (backward compatibility)
 * @returns {boolean} Whether touch events are supported
 */
export function supportsTouchEvents() {
  return getTouchSupport().supported;
}

/**
 * Return browser-specific touch event names
 * @returns {Object} Touch event name mapping
 */
export function getTouchEventNames() {
  const support = getTouchSupport();

  if (support.touch) {
    return {
      start: "touchstart",
      move: "touchmove",
      end: "touchend",
      cancel: "touchcancel",
    };
  } else if (support.pointer) {
    return {
      start: "pointerdown",
      move: "pointermove",
      end: "pointerup",
      cancel: "pointercancel",
    };
  } else if (support.msPointer) {
    return {
      start: "MSPointerDown",
      move: "MSPointerMove",
      end: "MSPointerUp",
      cancel: "MSPointerCancel",
    };
  }

  // Fallback: mouse events
  return {
    start: "mousedown",
    move: "mousemove",
    end: "mouseup",
    cancel: "mouseleave",
  };
}

/**
 * Validate if input target is valid
 * @param {any} target - Target to validate
 * @returns {Object} Validation result {isValid, type, error}
 */
export function validateTarget(target) {
  if (target === null || target === undefined) {
    return {
      isValid: false,
      type: "null",
      error: "Target cannot be null or undefined",
    };
  }

  if (typeof target === "string") {
    if (target.trim() === "") {
      return {
        isValid: false,
        type: "string",
        error: "Selector string cannot be empty",
      };
    }

    // Simple CSS selector validity check
    try {
      document.querySelector(target);
      return {
        isValid: true,
        type: "string",
        error: null,
      };
    } catch (e) {
      return {
        isValid: false,
        type: "string",
        error: `Invalid CSS selector: ${target}`,
      };
    }
  }

  if (target instanceof Element) {
    return {
      isValid: true,
      type: "element",
      error: null,
    };
  }

  if (target instanceof NodeList || Array.isArray(target)) {
    return {
      isValid: true,
      type: "collection",
      error: null,
    };
  }

  return {
    isValid: false,
    type: "unknown",
    error: `Unsupported target type: ${typeof target}`,
  };
}

/**
 * Validate configuration options and correct with defaults
 * @param {Object} options - Options to validate
 * @param {Object} defaults - Default values
 * @returns {Object} Validated options
 */
export function validateAndSanitizeOptions(options, defaults) {
  const sanitized = { ...defaults };
  const errors = [];

  if (!options || typeof options !== "object") {
    return { sanitized, errors: ["Options must be an object"] };
  }

  // Validate backgroundColor
  if (options.backgroundColor !== undefined) {
    if (
      typeof options.backgroundColor === "string" &&
      options.backgroundColor.trim() !== ""
    ) {
      sanitized.backgroundColor = options.backgroundColor;
    } else {
      errors.push(`Invalid backgroundColor: ${options.backgroundColor}`);
    }
  }

  // Validate maxScale
  if (options.maxScale !== undefined) {
    const maxScale = Number(options.maxScale);
    if (!isNaN(maxScale) && maxScale > 1 && maxScale <= 10) {
      sanitized.maxScale = maxScale;
    } else {
      errors.push(
        `Invalid maxScale: ${options.maxScale}. Must be between 1 and 10`
      );
    }
  }

  // Validate minScale
  if (options.minScale !== undefined) {
    const minScale = Number(options.minScale);
    if (!isNaN(minScale) && minScale >= 0.1 && minScale <= 1) {
      sanitized.minScale = minScale;
    } else {
      errors.push(
        `Invalid minScale: ${options.minScale}. Must be between 0.1 and 1`
      );
    }
  }

  // Validate transitionDuration
  if (options.transitionDuration !== undefined) {
    if (
      typeof options.transitionDuration === "string" &&
      /^\d+(\.\d+)?(s|ms)$/.test(options.transitionDuration.trim())
    ) {
      sanitized.transitionDuration = options.transitionDuration;
    } else {
      errors.push(`Invalid transitionDuration: ${options.transitionDuration}`);
    }
  }

  // Validate zIndex
  if (options.zIndex !== undefined) {
    const zIndex = Number(options.zIndex);
    if (!isNaN(zIndex) && Number.isInteger(zIndex) && zIndex >= 0) {
      sanitized.zIndex = zIndex;
    } else {
      errors.push(
        `Invalid zIndex: ${options.zIndex}. Must be a non-negative integer`
      );
    }
  }

  // Handle case where minScale is greater than maxScale
  if (sanitized.minScale >= sanitized.maxScale) {
    errors.push(
      `minScale (${sanitized.minScale}) must be less than maxScale (${sanitized.maxScale})`
    );
    sanitized.minScale = Math.min(sanitized.minScale, sanitized.maxScale - 0.1);
  }

  return { sanitized, errors };
}

/**
 * Check if element can be used as image (img tag or element with background-image)
 * @param {Element} element - Element to check
 * @returns {Object} Validation result {isValid, type, warning}
 */
export function validateImageElement(element) {
  if (!element || !element.tagName) {
    return {
      isValid: false,
      type: "invalid",
      warning: "Element is not a valid DOM element",
    };
  }

  const tagName = element.tagName.toLowerCase();

  // If img tag
  if (tagName === "img") {
    return {
      isValid: true,
      type: "img",
      warning: null,
    };
  }

  // If element with background-image
  const computedStyle = window.getComputedStyle(element);
  const backgroundImage = computedStyle.backgroundImage;

  if (backgroundImage && backgroundImage !== "none") {
    return {
      isValid: true,
      type: "background",
      warning:
        "Using background-image element. Some features may not work as expected.",
    };
  }

  return {
    isValid: false,
    type: tagName,
    warning: `Element '${tagName}' is not an image. PinchZoom is designed for image elements.`,
  };
}

/**
 * Check if DOM environment is ready
 * @returns {boolean} DOM ready state
 */
export function isDOMReady() {
  return (
    document && document.body && typeof document.querySelector === "function"
  );
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} Whether element is in viewport
 */
export function isElementInViewport(element) {
  if (!element || typeof element.getBoundingClientRect !== "function") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Detect browser features and return compatibility information
 * @returns {Object} Browser compatibility information
 */
export function getBrowserCompatibility() {
  const transformSupport = getTransformSupport();
  const touchSupport = getTouchSupport();

  return {
    transform: transformSupport,
    touch: touchSupport,
    requestAnimationFrame: typeof requestAnimationFrame !== "undefined",
    addEventListener: typeof document.addEventListener !== "undefined",
    querySelector: typeof document.querySelector !== "undefined",
    getComputedStyle: typeof window.getComputedStyle !== "undefined",
    isModernBrowser: transformSupport.supported && touchSupport.supported,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    recommendations: generateCompatibilityRecommendations(
      transformSupport,
      touchSupport
    ),
  };
}

/**
 * Generate compatibility-based recommendations
 * @param {Object} transformSupport - Transform support information
 * @param {Object} touchSupport - Touch support information
 * @returns {Array} Array of recommendations
 */
function generateCompatibilityRecommendations(transformSupport, touchSupport) {
  const recommendations = [];

  if (!transformSupport.supported) {
    recommendations.push(
      "CSS transforms not supported. Using fallback scaling method."
    );
  }

  if (!touchSupport.supported) {
    recommendations.push(
      "Touch events not supported. Consider adding mouse event fallback."
    );
  }

  if (transformSupport.prefixed) {
    recommendations.push(
      "Using vendor-prefixed CSS transforms for compatibility."
    );
  }

  if (touchSupport.preferredEvents === "pointer") {
    recommendations.push("Using Pointer Events for better touch handling.");
  } else if (touchSupport.preferredEvents === "mspointer") {
    recommendations.push("Using MS Pointer Events for IE compatibility.");
  }

  return recommendations;
}

/**
 * Safe requestAnimationFrame execution (with fallback)
 * @param {Function} callback - Callback function to execute
 * @returns {number} Animation frame ID
 */
export function safeRequestAnimationFrame(callback) {
  if (typeof requestAnimationFrame !== "undefined") {
    return requestAnimationFrame(callback);
  } else if (typeof webkitRequestAnimationFrame !== "undefined") {
    return webkitRequestAnimationFrame(callback);
  } else if (typeof mozRequestAnimationFrame !== "undefined") {
    return mozRequestAnimationFrame(callback);
  } else if (typeof msRequestAnimationFrame !== "undefined") {
    return msRequestAnimationFrame(callback);
  } else {
    // Fallback: use setTimeout
    return setTimeout(callback, 16); // ~60fps
  }
}

/**
 * Safe cancelAnimationFrame execution (with fallback)
 * @param {number} id - Animation frame ID
 */
export function safeCancelAnimationFrame(id) {
  if (typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(id);
  } else if (typeof webkitCancelAnimationFrame !== "undefined") {
    webkitCancelAnimationFrame(id);
  } else if (typeof mozCancelAnimationFrame !== "undefined") {
    mozCancelAnimationFrame(id);
  } else if (typeof msCancelAnimationFrame !== "undefined") {
    msCancelAnimationFrame(id);
  } else {
    // Fallback: use clearTimeout
    clearTimeout(id);
  }
}

/**
 * Return browser-specific CSS property name
 * @param {string} property - Standard CSS property name
 * @returns {string} Browser-specific CSS property name
 */
export function getCSSPropertyName(property) {
  const testElement = document.createElement("div");
  const style = testElement.style;

  // Check if standard property is supported
  if (property in style) {
    return property;
  }

  // Try vendor prefixes
  const prefixes = ["webkit", "moz", "ms", "o"];
  const capitalizedProperty =
    property.charAt(0).toUpperCase() + property.slice(1);

  for (const prefix of prefixes) {
    const prefixedProperty = prefix + capitalizedProperty;
    if (prefixedProperty in style) {
      return prefixedProperty;
    }
  }

  return null; // Not supported
}

/**
 * Detect legacy browser
 * @returns {Object} Legacy browser information
 */
export function detectLegacyBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();

  const isIE =
    userAgent.indexOf("msie") !== -1 || userAgent.indexOf("trident") !== -1;
  const isOldWebkit =
    userAgent.indexOf("webkit") !== -1 && userAgent.indexOf("chrome") === -1;
  const isOldFirefox =
    userAgent.indexOf("firefox") !== -1 &&
    parseFloat(userAgent.match(/firefox\/(\d+\.\d+)/)?.[1] || "0") < 50;

  return {
    isLegacy: isIE || isOldWebkit || isOldFirefox,
    isIE,
    isOldWebkit,
    isOldFirefox,
    needsPolyfills: isIE || isOldWebkit,
    supportLevel: isIE
      ? "minimal"
      : isOldWebkit || isOldFirefox
      ? "partial"
      : "full",
  };
}

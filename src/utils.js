/**
 * 유틸리티 함수들 - DOM 조작 및 계산을 위한 헬퍼 함수들
 */

/**
 * 두 터치 포인트 사이의 거리를 계산합니다
 * @param {Touch} touch1 - 첫 번째 터치 포인트
 * @param {Touch} touch2 - 두 번째 터치 포인트
 * @returns {number} 두 포인트 사이의 거리
 */
export function getDistance(touch1, touch2) {
  return Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
  );
}

/**
 * 두 터치 포인트의 중점을 계산합니다
 * @param {Touch} touch1 - 첫 번째 터치 포인트
 * @param {Touch} touch2 - 두 번째 터치 포인트
 * @returns {Object} 중점 좌표 {x, y}
 */
export function getMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

/**
 * 크로스 브라우저 이벤트 리스너 추가
 * @param {Element} element - 이벤트를 추가할 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object|boolean} options - 이벤트 옵션 (객체 또는 useCapture boolean)
 */
export function addEvent(element, event, handler, options = {}) {
  if (!element || !event || !handler) {
    return false;
  }

  try {
    if (element.addEventListener) {
      // 현대 브라우저
      element.addEventListener(event, handler, options);
    } else if (element.attachEvent) {
      // IE8 이하
      element.attachEvent("on" + event, handler);
    } else {
      // 매우 오래된 브라우저 폴백
      element["on" + event] = handler;
    }
    return true;
  } catch (error) {
    console.warn("Failed to add event listener:", error);
    return false;
  }
}

/**
 * 크로스 브라우저 이벤트 리스너 제거
 * @param {Element} element - 이벤트를 제거할 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object|boolean} options - 이벤트 옵션 (addEventListener와 동일한 옵션)
 */
export function removeEvent(element, event, handler, options = {}) {
  if (!element || !event || !handler) {
    return false;
  }

  try {
    if (element.removeEventListener) {
      // 현대 브라우저
      element.removeEventListener(event, handler, options);
    } else if (element.detachEvent) {
      // IE8 이하
      element.detachEvent("on" + event, handler);
    } else {
      // 매우 오래된 브라우저 폴백
      element["on" + event] = null;
    }
    return true;
  } catch (error) {
    console.warn("Failed to remove event listener:", error);
    return false;
  }
}

/**
 * 이벤트 객체를 정규화합니다 (크로스 브라우저 호환성)
 * @param {Event} event - 원본 이벤트 객체
 * @returns {Event} 정규화된 이벤트 객체
 */
export function normalizeEvent(event) {
  // IE에서는 window.event를 사용
  event = event || window.event;

  if (!event) {
    return null;
  }

  // preventDefault 메서드 추가 (IE 호환성)
  if (!event.preventDefault) {
    event.preventDefault = function () {
      event.returnValue = false;
    };
  }

  // stopPropagation 메서드 추가 (IE 호환성)
  if (!event.stopPropagation) {
    event.stopPropagation = function () {
      event.cancelBubble = true;
    };
  }

  // target 속성 정규화 (IE에서는 srcElement 사용)
  if (!event.target) {
    event.target = event.srcElement;
  }

  return event;
}

/**
 * 요소가 이미지인지 확인합니다
 * @param {Element} element - 확인할 요소
 * @returns {boolean} 이미지 요소인지 여부
 */
export function isImageElement(element) {
  return element && element.tagName && element.tagName.toLowerCase() === "img";
}

/**
 * 선택자 또는 DOM 요소를 배열로 변환합니다
 * @param {string|Element|NodeList} target - 선택자, DOM 요소 또는 NodeList
 * @returns {Element[]} DOM 요소 배열
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
 * 값을 최소값과 최대값 사이로 제한합니다
 * @param {number} value - 제한할 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} 제한된 값
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * CSS 변환을 지원하는지 확인하고 지원되는 속성을 반환합니다
 * @returns {Object} CSS 변환 지원 정보 {supported, property, prefixed}
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
 * CSS 변환을 지원하는지 확인합니다 (하위 호환성)
 * @returns {boolean} CSS 변환 지원 여부
 */
export function supportsTransform() {
  return getTransformSupport().supported;
}

/**
 * 크로스 브라우저 CSS 변환 적용
 * @param {Element} element - 변환을 적용할 요소
 * @param {string} transformValue - 변환 값 (예: "scale(2) translate(10px, 20px)")
 */
export function applyTransform(element, transformValue) {
  const support = getTransformSupport();

  if (support.supported) {
    element.style[support.property] = transformValue;

    // 추가 벤더 프리픽스 적용 (안전성을 위해)
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
 * 크로스 브라우저 CSS 트랜지션 적용
 * @param {Element} element - 트랜지션을 적용할 요소
 * @param {string} transitionValue - 트랜지션 값
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
 * 터치 이벤트 지원 정보를 반환합니다
 * @returns {Object} 터치 이벤트 지원 정보
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
 * 터치 이벤트를 지원하는지 확인합니다 (하위 호환성)
 * @returns {boolean} 터치 이벤트 지원 여부
 */
export function supportsTouchEvents() {
  return getTouchSupport().supported;
}

/**
 * 브라우저별 터치 이벤트 이름을 반환합니다
 * @returns {Object} 터치 이벤트 이름 매핑
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

  // 폴백: 마우스 이벤트
  return {
    start: "mousedown",
    move: "mousemove",
    end: "mouseup",
    cancel: "mouseleave",
  };
}

/**
 * 입력 대상이 유효한지 검증합니다
 * @param {any} target - 검증할 대상
 * @returns {Object} 검증 결과 {isValid, type, error}
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

    // CSS 선택자 유효성 간단 검사
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
 * 설정 옵션을 검증하고 기본값으로 보정합니다
 * @param {Object} options - 검증할 옵션
 * @param {Object} defaults - 기본값
 * @returns {Object} 검증된 옵션
 */
export function validateAndSanitizeOptions(options, defaults) {
  const sanitized = { ...defaults };
  const errors = [];

  if (!options || typeof options !== "object") {
    return { sanitized, errors: ["Options must be an object"] };
  }

  // backgroundColor 검증
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

  // maxScale 검증
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

  // minScale 검증
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

  // transitionDuration 검증
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

  // zIndex 검증
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

  // minScale이 maxScale보다 큰 경우 처리
  if (sanitized.minScale >= sanitized.maxScale) {
    errors.push(
      `minScale (${sanitized.minScale}) must be less than maxScale (${sanitized.maxScale})`
    );
    sanitized.minScale = Math.min(sanitized.minScale, sanitized.maxScale - 0.1);
  }

  return { sanitized, errors };
}

/**
 * 요소가 이미지로 사용 가능한지 확인합니다 (img 태그 또는 background-image가 있는 요소)
 * @param {Element} element - 확인할 요소
 * @returns {Object} 검증 결과 {isValid, type, warning}
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

  // img 태그인 경우
  if (tagName === "img") {
    return {
      isValid: true,
      type: "img",
      warning: null,
    };
  }

  // background-image가 있는 요소인 경우
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
 * DOM 환경이 준비되었는지 확인합니다
 * @returns {boolean} DOM 준비 상태
 */
export function isDOMReady() {
  return (
    document && document.body && typeof document.querySelector === "function"
  );
}

/**
 * 요소가 뷰포트에 있는지 확인합니다
 * @param {Element} element - 확인할 요소
 * @returns {boolean} 뷰포트 내 존재 여부
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
 * 브라우저 기능 감지 및 호환성 정보를 반환합니다
 * @returns {Object} 브라우저 호환성 정보
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
 * 호환성 기반 권장사항을 생성합니다
 * @param {Object} transformSupport - 변환 지원 정보
 * @param {Object} touchSupport - 터치 지원 정보
 * @returns {Array} 권장사항 배열
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
 * 안전한 requestAnimationFrame 실행 (폴백 포함)
 * @param {Function} callback - 실행할 콜백 함수
 * @returns {number} 애니메이션 프레임 ID
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
    // 폴백: setTimeout 사용
    return setTimeout(callback, 16); // ~60fps
  }
}

/**
 * 안전한 cancelAnimationFrame 실행 (폴백 포함)
 * @param {number} id - 애니메이션 프레임 ID
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
    // 폴백: clearTimeout 사용
    clearTimeout(id);
  }
}

/**
 * 브라우저별 CSS 속성 이름을 반환합니다
 * @param {string} property - 표준 CSS 속성 이름
 * @returns {string} 브라우저별 CSS 속성 이름
 */
export function getCSSPropertyName(property) {
  const testElement = document.createElement("div");
  const style = testElement.style;

  // 표준 속성이 지원되는지 확인
  if (property in style) {
    return property;
  }

  // 벤더 프리픽스 시도
  const prefixes = ["webkit", "moz", "ms", "o"];
  const capitalizedProperty =
    property.charAt(0).toUpperCase() + property.slice(1);

  for (const prefix of prefixes) {
    const prefixedProperty = prefix + capitalizedProperty;
    if (prefixedProperty in style) {
      return prefixedProperty;
    }
  }

  return null; // 지원되지 않음
}

/**
 * 레거시 브라우저 감지
 * @returns {Object} 레거시 브라우저 정보
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

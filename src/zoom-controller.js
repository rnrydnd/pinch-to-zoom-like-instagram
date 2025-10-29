/**
 * 이미지 스케일링과 위치 조정을 담당하는 ZoomController 클래스
 */

import {
  clamp,
  getTransformSupport,
  applyTransform,
  applyTransition,
} from "./utils.js";
import { errorHandler } from "./error-handler.js";

export class ZoomController {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      maxScale: options.maxScale || 5,
      minScale: options.minScale || 1,
      transitionDuration: options.transitionDuration || "0.3s",
      ...options,
    };

    this.currentScale = 1;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;
    this.initialPosition = { x: 0, y: 0 };

    // CSS 변환 지원 확인
    this.transformSupport = getTransformSupport();

    this.setupElement();
  }

  /**
   * 요소 초기 설정
   */
  setupElement() {
    return errorHandler.safeExecute(
      () => {
        // 크로스 브라우저 트랜지션 설정
        const transitionValue = `transform ${this.options.transitionDuration} ease-out`;
        applyTransition(this.element, transitionValue);

        // 변환을 지원하지 않는 브라우저를 위한 폴백 트랜지션
        if (!this.transformSupport.supported) {
          const fallbackTransition = `width ${this.options.transitionDuration} ease-out, height ${this.options.transitionDuration} ease-out`;
          applyTransition(this.element, fallbackTransition);
        }

        return true;
      },
      "setting up zoom element",
      false
    );
  }

  /**
   * CSS 변환을 적용합니다
   * @param {number} scale - 스케일 값
   * @param {number} translateX - X축 이동값
   * @param {number} translateY - Y축 이동값
   */
  applyTransform(scale, translateX = 0, translateY = 0) {
    return errorHandler.safeExecute(
      () => {
        // 스케일 값 제한
        const clampedScale = clamp(
          scale,
          this.options.minScale,
          this.options.maxScale
        );

        this.currentScale = clampedScale;
        this.currentTranslateX = translateX;
        this.currentTranslateY = translateY;

        if (this.transformSupport.supported) {
          const transform = `scale(${clampedScale}) translate(${translateX}px, ${translateY}px)`;
          applyTransform(this.element, transform);
        } else {
          // 변환을 지원하지 않는 브라우저를 위한 폴백
          this.applyFallbackTransform(clampedScale, translateX, translateY);
        }

        // z-index 및 position 설정 (확대 시)
        if (clampedScale > 1) {
          this.element.style.zIndex = this.options.zIndex || "1000";
          this.element.style.position = "relative";
        }

        return true;
      },
      "applying transform",
      false
    );
  }

  /**
   * 변환을 지원하지 않는 브라우저를 위한 폴백
   * @param {number} scale - 스케일 값
   * @param {number} translateX - X축 이동값 (현재 미사용)
   * @param {number} translateY - Y축 이동값 (현재 미사용)
   */
  applyFallbackTransform(scale, translateX, translateY) {
    // 기본적인 크기 조정만 지원
    const originalWidth = this.element.naturalWidth || this.element.offsetWidth;
    const originalHeight =
      this.element.naturalHeight || this.element.offsetHeight;

    if (originalWidth && originalHeight) {
      this.element.style.width = `${originalWidth * scale}px`;
      this.element.style.height = `${originalHeight * scale}px`;
    }
  }

  /**
   * 변환을 초기 상태로 리셋합니다
   */
  resetTransform() {
    return errorHandler.safeExecute(
      () => {
        this.currentScale = 1;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;

        if (this.transformSupport.supported) {
          applyTransform(this.element, "scale(1) translate(0px, 0px)");
        } else {
          // 폴백: 원래 크기로 복원
          this.element.style.width = "";
          this.element.style.height = "";
        }

        return true;
      },
      "resetting transform",
      false
    );
  }

  /**
   * 스케일 값을 계산합니다
   * @param {number} initialDistance - 초기 거리
   * @param {number} currentDistance - 현재 거리
   * @returns {number} 계산된 스케일 값
   */
  calculateScale(initialDistance, currentDistance) {
    if (initialDistance === 0) return 1;

    const scaleFactor = currentDistance / initialDistance;
    return clamp(scaleFactor, this.options.minScale, this.options.maxScale);
  }

  /**
   * 두 터치 포인트의 중점을 계산합니다
   * @param {Touch} touch1 - 첫 번째 터치 포인트
   * @param {Touch} touch2 - 두 번째 터치 포인트
   * @returns {Object} 중점 좌표 {x, y}
   */
  calculateMidpoint(touch1, touch2) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  /**
   * 트랜지션 종료 이벤트 리스너를 추가합니다 (크로스 브라우저 지원)
   * @param {Function} callback - 트랜지션 종료 시 실행할 콜백
   */
  onTransitionEnd(callback) {
    const handleTransitionEnd = () => {
      if (this.currentScale === 1) {
        // 원래 상태로 돌아왔을 때 z-index와 position 초기화
        this.element.style.zIndex = "";
        this.element.style.position = "";
      }

      if (callback) {
        callback();
      }
    };

    // 크로스 브라우저 트랜지션 종료 이벤트 지원
    const transitionEndEvents = [
      "transitionend",
      "webkitTransitionEnd",
      "mozTransitionEnd",
      "msTransitionEnd",
      "oTransitionEnd",
    ];

    transitionEndEvents.forEach((eventName) => {
      this.element.addEventListener(eventName, handleTransitionEnd);
    });

    return handleTransitionEnd;
  }

  /**
   * 현재 변환 상태를 반환합니다
   * @returns {Object} 현재 변환 상태
   */
  getTransformState() {
    return {
      scale: this.currentScale,
      translateX: this.currentTranslateX,
      translateY: this.currentTranslateY,
      isZoomed: this.currentScale > 1,
    };
  }

  /**
   * 옵션을 업데이트합니다
   * @param {Object} newOptions - 새로운 옵션
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // 트랜지션 업데이트
    if (newOptions.transitionDuration) {
      const transitionValue = `transform ${this.options.transitionDuration} ease-out`;
      applyTransition(this.element, transitionValue);

      // 변환을 지원하지 않는 브라우저를 위한 폴백 트랜지션
      if (!this.transformSupport.supported) {
        const fallbackTransition = `width ${this.options.transitionDuration} ease-out, height ${this.options.transitionDuration} ease-out`;
        applyTransition(this.element, fallbackTransition);
      }
    }
  }

  /**
   * ZoomController를 정리합니다
   */
  destroy() {
    return errorHandler.safeExecute(
      () => {
        this.resetTransform();

        // 크로스 브라우저 트랜지션 초기화
        applyTransition(this.element, "");

        this.element.style.zIndex = "";
        this.element.style.position = "";
        return true;
      },
      "destroying zoom controller",
      false
    );
  }
}

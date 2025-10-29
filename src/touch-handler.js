/**
 * 터치 이벤트 처리를 담당하는 TouchHandler 클래스
 */

import {
  addEvent,
  removeEvent,
  getDistance,
  getMidpoint,
  getTouchEventNames,
  getTouchSupport,
  normalizeEvent,
} from "./utils.js";
import { errorHandler } from "./error-handler.js";

export class TouchHandler {
  constructor(element, callbacks = {}) {
    this.element = element;
    this.callbacks = callbacks;
    this.isActive = false;
    this.initialDistance = 0;
    this.currentScale = 1;
    this.touches = [];

    // 터치 지원 정보 및 이벤트 이름 가져오기
    this.touchSupport = getTouchSupport();
    this.eventNames = getTouchEventNames();

    // 바인딩된 메서드들 (이벤트 리스너 제거를 위해 필요)
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
  }

  /**
   * 터치 이벤트 리스너를 바인딩합니다 (크로스 브라우저 지원)
   */
  bindEvents() {
    return errorHandler.safeExecute(
      () => {
        const options = { passive: false };

        // 크로스 브라우저 이벤트 바인딩
        addEvent(
          this.element,
          this.eventNames.start,
          this.boundHandleTouchStart,
          options
        );
        addEvent(
          this.element,
          this.eventNames.move,
          this.boundHandleTouchMove,
          options
        );
        addEvent(
          this.element,
          this.eventNames.end,
          this.boundHandleTouchEnd,
          options
        );
        addEvent(
          this.element,
          this.eventNames.cancel,
          this.boundHandleTouchEnd,
          options
        );

        return true;
      },
      "binding touch events",
      false
    );
  }

  /**
   * 터치 이벤트 리스너를 제거합니다 (크로스 브라우저 지원)
   */
  unbindEvents() {
    return errorHandler.safeExecute(
      () => {
        const options = { passive: false };

        // 크로스 브라우저 이벤트 제거
        removeEvent(
          this.element,
          this.eventNames.start,
          this.boundHandleTouchStart,
          options
        );
        removeEvent(
          this.element,
          this.eventNames.move,
          this.boundHandleTouchMove,
          options
        );
        removeEvent(
          this.element,
          this.eventNames.end,
          this.boundHandleTouchEnd,
          options
        );
        removeEvent(
          this.element,
          this.eventNames.cancel,
          this.boundHandleTouchEnd,
          options
        );

        return true;
      },
      "unbinding touch events",
      false
    );
  }

  /**
   * 터치 시작 이벤트 처리 (크로스 브라우저 지원)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - 터치/포인터/마우스 이벤트
   */
  handleTouchStart(event) {
    event = normalizeEvent(event);
    if (!event) return;

    const touches = this.extractTouches(event);

    if (touches.length === 2) {
      event.preventDefault();

      const touch1 = touches[0];
      const touch2 = touches[1];

      this.isActive = true;
      this.initialDistance = getDistance(touch1, touch2);
      this.touches = touches;

      const midpoint = getMidpoint(touch1, touch2);

      // 콜백 실행
      if (this.callbacks.onTouchStart) {
        this.callbacks.onTouchStart({
          initialDistance: this.initialDistance,
          midpoint,
          touches: this.touches,
        });
      }
    }
  }

  /**
   * 터치 이동 이벤트 처리 (크로스 브라우저 지원)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - 터치/포인터/마우스 이벤트
   */
  handleTouchMove(event) {
    event = normalizeEvent(event);
    if (!event) return;

    const touches = this.extractTouches(event);

    if (touches.length === 2 && this.isActive) {
      event.preventDefault();

      const touch1 = touches[0];
      const touch2 = touches[1];
      const currentDistance = getDistance(touch1, touch2);
      const midpoint = getMidpoint(touch1, touch2);

      // 스케일 계산
      const scaleFactor = currentDistance / this.initialDistance;
      this.currentScale = scaleFactor;

      this.touches = touches;

      // 콜백 실행
      if (this.callbacks.onTouchMove) {
        this.callbacks.onTouchMove({
          scaleFactor,
          currentScale: this.currentScale,
          midpoint,
          touches: this.touches,
          initialDistance: this.initialDistance,
          currentDistance,
        });
      }
    }
  }

  /**
   * 터치 종료 이벤트 처리 (크로스 브라우저 지원)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - 터치/포인터/마우스 이벤트
   */
  handleTouchEnd(event) {
    event = normalizeEvent(event);
    if (!event) return;

    const touches = this.extractTouches(event);

    if (touches.length === 0 && this.isActive) {
      event.preventDefault();

      this.isActive = false;
      this.initialDistance = 0;
      this.currentScale = 1;
      this.touches = [];

      // 콜백 실행
      if (this.callbacks.onTouchEnd) {
        this.callbacks.onTouchEnd();
      }
    }
  }

  /**
   * 이벤트에서 터치 포인트를 추출합니다 (크로스 브라우저 지원)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - 이벤트 객체
   * @returns {Array} 터치 포인트 배열
   */
  extractTouches(event) {
    if (event.touches) {
      // 터치 이벤트
      return Array.from(event.touches);
    } else if (event.pointerType !== undefined) {
      // 포인터 이벤트 - 현재는 단일 포인터만 지원
      return event.isPrimary ? [event] : [];
    } else {
      // 마우스 이벤트 - 폴백으로 단일 포인트만 지원
      return [event];
    }
  }

  /**
   * 현재 터치 상태를 반환합니다
   * @returns {Object} 터치 상태 정보
   */
  getTouchState() {
    return {
      isActive: this.isActive,
      initialDistance: this.initialDistance,
      currentScale: this.currentScale,
      touches: [...this.touches],
      touchSupport: this.touchSupport,
      eventNames: this.eventNames,
    };
  }

  /**
   * TouchHandler를 정리합니다
   */
  destroy() {
    this.unbindEvents();
    this.isActive = false;
    this.touches = [];
    this.callbacks = {};
  }
}

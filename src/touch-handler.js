/**
 * TouchHandler class responsible for touch event handling
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

    // Get touch support information and event names
    this.touchSupport = getTouchSupport();
    this.eventNames = getTouchEventNames();

    // Bound methods (needed for event listener removal)
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
  }

  /**
   * Bind touch event listeners (cross-browser support)
   */
  bindEvents() {
    return errorHandler.safeExecute(
      () => {
        const options = { passive: false };

        // Cross-browser event binding
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
   * Remove touch event listeners (cross-browser support)
   */
  unbindEvents() {
    return errorHandler.safeExecute(
      () => {
        const options = { passive: false };

        // Cross-browser event removal
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
   * Handle touch start event (cross-browser support)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - Touch/pointer/mouse event
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

      // Execute callback
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
   * Handle touch move event (cross-browser support)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - Touch/pointer/mouse event
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

      // Calculate scale
      const scaleFactor = currentDistance / this.initialDistance;
      this.currentScale = scaleFactor;

      this.touches = touches;

      // Execute callback
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
   * Handle touch end event (cross-browser support)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - Touch/pointer/mouse event
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

      // Execute callback
      if (this.callbacks.onTouchEnd) {
        this.callbacks.onTouchEnd();
      }
    }
  }

  /**
   * Extract touch points from event (cross-browser support)
   * @param {TouchEvent|PointerEvent|MouseEvent} event - Event object
   * @returns {Array} Array of touch points
   */
  extractTouches(event) {
    if (event.touches) {
      // Touch events
      return Array.from(event.touches);
    } else if (event.pointerType !== undefined) {
      // Pointer events - currently only single pointer supported
      return event.isPrimary ? [event] : [];
    } else {
      // Mouse events - fallback with single point support only
      return [event];
    }
  }

  /**
   * Return current touch state
   * @returns {Object} Touch state information
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
   * Clean up TouchHandler
   */
  destroy() {
    this.unbindEvents();
    this.isActive = false;
    this.touches = [];
    this.callbacks = {};
  }
}

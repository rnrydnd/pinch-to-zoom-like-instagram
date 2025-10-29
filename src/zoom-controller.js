/**
 * ZoomController class responsible for image scaling and positioning
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

    // Check CSS transform support
    this.transformSupport = getTransformSupport();

    this.setupElement();
  }

  /**
   * Initial element setup
   */
  setupElement() {
    return errorHandler.safeExecute(
      () => {
        // Set up cross-browser transition
        const transitionValue = `transform ${this.options.transitionDuration} ease-out`;
        applyTransition(this.element, transitionValue);

        // Fallback transition for browsers that don't support transforms
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
   * Apply CSS transform
   * @param {number} scale - Scale value
   * @param {number} translateX - X-axis translation
   * @param {number} translateY - Y-axis translation
   */
  applyTransform(scale, translateX = 0, translateY = 0) {
    return errorHandler.safeExecute(
      () => {
        // Clamp scale value
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
          // Fallback for browsers that don't support transforms
          this.applyFallbackTransform(clampedScale, translateX, translateY);
        }

        // Set z-index and position (when zoomed)
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
   * Fallback for browsers that don't support transforms
   * @param {number} scale - Scale value
   * @param {number} translateX - X-axis translation (currently unused)
   * @param {number} translateY - Y-axis translation (currently unused)
   */
  applyFallbackTransform(scale, translateX, translateY) {
    // Only basic size adjustment is supported
    const originalWidth = this.element.naturalWidth || this.element.offsetWidth;
    const originalHeight =
      this.element.naturalHeight || this.element.offsetHeight;

    if (originalWidth && originalHeight) {
      this.element.style.width = `${originalWidth * scale}px`;
      this.element.style.height = `${originalHeight * scale}px`;
    }
  }

  /**
   * Reset transform to initial state
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
          // Fallback: restore to original size
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
   * Calculate scale value
   * @param {number} initialDistance - Initial distance
   * @param {number} currentDistance - Current distance
   * @returns {number} Calculated scale value
   */
  calculateScale(initialDistance, currentDistance) {
    if (initialDistance === 0) return 1;

    const scaleFactor = currentDistance / initialDistance;
    return clamp(scaleFactor, this.options.minScale, this.options.maxScale);
  }

  /**
   * Calculate midpoint of two touch points
   * @param {Touch} touch1 - First touch point
   * @param {Touch} touch2 - Second touch point
   * @returns {Object} Midpoint coordinates {x, y}
   */
  calculateMidpoint(touch1, touch2) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  /**
   * Add transition end event listener (cross-browser support)
   * @param {Function} callback - Callback to execute on transition end
   */
  onTransitionEnd(callback) {
    const handleTransitionEnd = () => {
      if (this.currentScale === 1) {
        // Reset z-index and position when returned to original state
        this.element.style.zIndex = "";
        this.element.style.position = "";
      }

      if (callback) {
        callback();
      }
    };

    // Cross-browser transition end event support
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
   * Return current transform state
   * @returns {Object} Current transform state
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
   * Update options
   * @param {Object} newOptions - New options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // Update transition
    if (newOptions.transitionDuration) {
      const transitionValue = `transform ${this.options.transitionDuration} ease-out`;
      applyTransition(this.element, transitionValue);

      // Fallback transition for browsers that don't support transforms
      if (!this.transformSupport.supported) {
        const fallbackTransition = `width ${this.options.transitionDuration} ease-out, height ${this.options.transitionDuration} ease-out`;
        applyTransition(this.element, fallbackTransition);
      }
    }
  }

  /**
   * Clean up ZoomController
   */
  destroy() {
    return errorHandler.safeExecute(
      () => {
        this.resetTransform();

        // Reset cross-browser transition
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

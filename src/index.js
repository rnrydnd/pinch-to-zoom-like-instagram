/**
 * PinchZoom Library - Vanilla JavaScript library providing Instagram-like pinch zoom functionality
 */

import { TouchHandler } from "./touch-handler.js";
import { ZoomController } from "./zoom-controller.js";
import { OverlayManager } from "./overlay-manager.js";
import {
  getElements,
  isImageElement,
  validateTarget,
  validateAndSanitizeOptions,
  validateImageElement,
  isDOMReady,
  supportsTouchEvents,
  getBrowserCompatibility,
  detectLegacyBrowser,
} from "./utils.js";
import { errorHandler, logger } from "./error-handler.js";

/**
 * Default configuration options
 */
const DEFAULT_OPTIONS = {
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  maxScale: 5,
  minScale: 1,
  transitionDuration: "0.3s",
  zIndex: 1000,
};

/**
 * PinchZoom main class
 */
export class PinchZoom {
  constructor(target, options = {}) {
    // Check DOM environment
    if (!isDOMReady()) {
      throw new Error(
        "PinchZoom requires a DOM environment. Make sure to initialize after DOM is ready."
      );
    }

    // Check browser compatibility
    this.compatibility = getBrowserCompatibility();
    this.legacyBrowser = detectLegacyBrowser();

    // Output compatibility warnings
    if (!this.compatibility.touch.supported) {
      logger.warn(
        "Touch events are not supported in this environment. PinchZoom may not work as expected."
      );
    }

    if (!this.compatibility.transform.supported) {
      logger.warn(
        "CSS transforms are not supported. Using fallback scaling method."
      );
    }

    if (this.legacyBrowser.isLegacy) {
      logger.warn(
        `Legacy browser detected (${this.legacyBrowser.supportLevel} support). Some features may be limited.`
      );
    }

    // Output compatibility recommendations
    this.compatibility.recommendations.forEach((recommendation) => {
      logger.info(`Compatibility: ${recommendation}`);
    });

    // Validate input target
    const targetValidation = validateTarget(target);
    if (!targetValidation.isValid) {
      throw new Error(`Invalid target: ${targetValidation.error}`);
    }

    // Validate and sanitize options
    const { sanitized: validatedOptions, errors } = validateAndSanitizeOptions(
      options,
      DEFAULT_OPTIONS
    );

    // Output option errors as warnings
    if (errors.length > 0) {
      errors.forEach((error) => {
        errorHandler.handleConfigurationError(
          "options",
          error,
          "using defaults"
        );
      });
    }

    this.target = target;
    this.options = validatedOptions;
    this.instances = [];
    this.isInitialized = false;
    this.initializationErrors = [];

    // Auto-initialize
    this.init();
  }

  /**
   * Initialize PinchZoom
   */
  init() {
    if (this.isInitialized) {
      logger.warn("PinchZoom is already initialized");
      return this;
    }

    // Initialize error list
    this.initializationErrors = [];

    const elements = errorHandler.safeExecute(
      () => getElements(this.target),
      "getting elements",
      []
    );

    if (elements.length === 0) {
      const error = "No elements found for the given target";
      this.initializationErrors.push(error);
      errorHandler.handleValidationError(error, this.target);
      return this;
    }

    let successCount = 0;
    let skipCount = 0;

    elements.forEach((element, index) => {
      // Validate element
      const imageValidation = validateImageElement(element);

      if (!imageValidation.isValid) {
        const error = `Element ${index + 1}: ${imageValidation.warning}`;
        this.initializationErrors.push(error);
        errorHandler.handleNonImageWarning(element);
        skipCount++;
        return;
      }

      // Output warning but continue if there's a warning
      if (imageValidation.warning) {
        logger.warn(`Element ${index + 1}: ${imageValidation.warning}`);
      }

      // Attempt to initialize element
      const success = this.initializeElement(element);
      if (success) {
        successCount++;
      } else {
        skipCount++;
      }
    });

    this.isInitialized = true;

    // Log initialization results
    if (successCount > 0) {
      logger.info(`PinchZoom initialized on ${successCount} elements`);
    }

    if (skipCount > 0) {
      logger.warn(`Skipped ${skipCount} elements due to validation errors`);
    }

    if (successCount === 0) {
      logger.warn("No elements were successfully initialized");
    }

    return this;
  }

  /**
   * Initialize PinchZoom on individual element
   * @param {Element} element - Image element to initialize
   * @returns {boolean} Whether initialization was successful
   */
  initializeElement(element) {
    return (
      errorHandler.handleRetryableError(
        "element initialization",
        () => {
          // Check if element is already initialized
          if (element._pinchZoomInstance) {
            logger.warn("Element already has PinchZoom initialized", element);
            return false;
          }

          // Check if element is attached to DOM
          if (!document.contains(element)) {
            throw new Error("Element is not attached to the DOM");
          }

          // Create component instances (with retry capability)
          const overlayManager = errorHandler.safeExecute(
            () => new OverlayManager(this.options),
            "creating overlay manager",
            null
          );

          const zoomController = errorHandler.safeExecute(
            () => new ZoomController(element, this.options),
            "creating zoom controller",
            null
          );

          if (!overlayManager || !zoomController) {
            throw new Error("Failed to create required components");
          }

          // Set up touch handler callbacks
          const touchCallbacks = {
            onTouchStart: () => {
              errorHandler.safeExecute(
                () => overlayManager.createOverlay(),
                "creating overlay on touch start"
              );
            },

            onTouchMove: (data) => {
              errorHandler.safeExecute(() => {
                const { scaleFactor } = data;

                // Apply scale limits
                const clampedScale = Math.min(
                  Math.max(scaleFactor, this.options.minScale),
                  this.options.maxScale
                );

                // Apply zoom
                zoomController.applyTransform(clampedScale, 0, 0);

                // Update overlay opacity (proportional to scale)
                const opacity = Math.min(
                  (0.8 * (clampedScale - 1)) / (this.options.maxScale - 1),
                  0.8
                );
                overlayManager.updateOverlay(opacity);
              }, "handling touch move");
            },

            onTouchEnd: () => {
              errorHandler.safeExecute(() => {
                // Restore to original state
                zoomController.resetTransform();
                overlayManager.updateOverlay(0);
              }, "handling touch end");
            },
          };

          const touchHandler = errorHandler.safeExecute(
            () => new TouchHandler(element, touchCallbacks),
            "creating touch handler",
            null
          );

          if (!touchHandler) {
            throw new Error("Failed to create touch handler");
          }

          // Bind events
          const bindingSuccess = errorHandler.safeExecute(
            () => touchHandler.bindEvents(),
            "binding touch events",
            false
          );

          if (!bindingSuccess) {
            throw new Error("Failed to bind touch events");
          }

          // Handle transition end events
          errorHandler.safeExecute(() => {
            zoomController.onTransitionEnd(() => {
              const state = zoomController.getTransformState();
              if (!state.isZoomed) {
                // Hide overlay when zoom is completely released
                setTimeout(() => {
                  errorHandler.safeExecute(
                    () => overlayManager.updateOverlay(0),
                    "hiding overlay after transition"
                  );
                }, 50);
              }
            });
          }, "setting up transition end handler");

          // Store instance information
          const instance = {
            element,
            touchHandler,
            zoomController,
            overlayManager,
            options: { ...this.options },
            createdAt: new Date().toISOString(),
          };

          this.instances.push(instance);
          element._pinchZoomInstance = instance;

          logger.debug("PinchZoom initialized for element", element);
          return true;
        },
        element
      ) !== null
    );
  }

  /**
   * Update options
   * @param {Object} newOptions - New options
   */
  updateOptions(newOptions) {
    if (!newOptions || typeof newOptions !== "object") {
      errorHandler.handleValidationError(
        "Invalid options provided",
        newOptions
      );
      return this;
    }

    // Validate new options
    const { sanitized: validatedOptions, errors } = validateAndSanitizeOptions(
      newOptions,
      this.options
    );

    // Output validation errors as warnings
    if (errors.length > 0) {
      errors.forEach((error) => {
        errorHandler.handleConfigurationError(
          "updateOptions",
          error,
          "keeping current value"
        );
      });
    }

    // Update only valid options
    this.options = validatedOptions;

    // Apply option updates to each instance
    let updateCount = 0;
    this.instances.forEach((instance, index) => {
      const success = errorHandler.safeExecute(
        () => {
          instance.options = { ...this.options };

          // Update options for each component
          if (
            instance.zoomController &&
            typeof instance.zoomController.updateOptions === "function"
          ) {
            instance.zoomController.updateOptions(validatedOptions);
          }

          if (
            instance.overlayManager &&
            typeof instance.overlayManager.updateOptions === "function"
          ) {
            instance.overlayManager.updateOptions(validatedOptions);
          }

          updateCount++;
          return true;
        },
        `updating options for instance ${index + 1}`,
        false
      );

      if (!success) {
        logger.warn(`Failed to update options for instance ${index + 1}`);
      }
    });

    logger.info(
      `Options updated for ${updateCount}/${this.instances.length} instances`,
      validatedOptions
    );
    return this;
  }

  /**
   * Remove and clean up PinchZoom
   */
  destroy() {
    this.instances.forEach((instance) => {
      const { element, touchHandler, zoomController, overlayManager } =
        instance;

      // Clean up components
      touchHandler.destroy();
      zoomController.destroy();
      overlayManager.destroy();

      // Remove instance reference from element
      delete element._pinchZoomInstance;
    });

    this.instances = [];
    this.isInitialized = false;

    logger.info("PinchZoom destroyed");
    return this;
  }

  /**
   * Return current state information
   * @returns {Object} State information
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      instanceCount: this.instances.length,
      options: { ...this.options },
      initializationErrors: [...this.initializationErrors],
      errorStats: errorHandler.getErrorStats(),
      supportInfo: {
        touchEvents: supportsTouchEvents(),
        domReady: isDOMReady(),
        compatibility: this.compatibility,
        legacyBrowser: this.legacyBrowser,
      },
    };
  }

  /**
   * Return initialization error list
   * @returns {string[]} Array of error messages
   */
  getInitializationErrors() {
    return [...this.initializationErrors];
  }

  /**
   * Return PinchZoom instance for specific element
   * @param {Element} element - Element to find
   * @returns {Object|null} Instance or null
   */
  getInstance(element) {
    if (!element) {
      return null;
    }

    return (
      this.instances.find((instance) => instance.element === element) || null
    );
  }

  /**
   * Check library health status
   * @returns {Object} Health status information
   */
  healthCheck() {
    const activeInstances = this.instances.filter((instance) => {
      return instance.element && document.contains(instance.element);
    });

    const orphanedInstances = this.instances.length - activeInstances.length;

    return {
      status: this.instances.length > 0 ? "healthy" : "no-instances",
      totalInstances: this.instances.length,
      activeInstances: activeInstances.length,
      orphanedInstances,
      hasErrors: this.initializationErrors.length > 0,
      errorCount: this.initializationErrors.length,
      recommendations: this.generateRecommendations(
        activeInstances,
        orphanedInstances
      ),
    };
  }

  /**
   * Generate recommendations based on health status
   * @param {Array} activeInstances - Array of active instances
   * @param {number} orphanedInstances - Number of orphaned instances
   * @returns {string[]} Array of recommendations
   */
  generateRecommendations(activeInstances, orphanedInstances) {
    const recommendations = [];

    if (orphanedInstances > 0) {
      recommendations.push(
        `Consider calling destroy() to clean up ${orphanedInstances} orphaned instances`
      );
    }

    if (this.initializationErrors.length > 0) {
      recommendations.push(
        "Check initialization errors and ensure all target elements are valid images"
      );
    }

    if (activeInstances.length === 0 && this.instances.length > 0) {
      recommendations.push(
        "All instances appear to be detached from DOM. Consider reinitializing."
      );
    }

    if (!this.compatibility.touch.supported) {
      recommendations.push(
        "Touch events not supported. Consider adding mouse event fallback."
      );
    }

    if (!this.compatibility.transform.supported) {
      recommendations.push(
        "CSS transforms not supported. Using fallback scaling method."
      );
    }

    if (this.legacyBrowser.isLegacy) {
      recommendations.push(
        `Legacy browser detected. Consider providing alternative interaction methods.`
      );
    }

    return recommendations;
  }
}

/**
 * Factory function - Alternative for convenient usage
 * @param {string|Element|NodeList} target - Target element
 * @param {Object} options - Options
 * @returns {PinchZoom|null} PinchZoom instance or null (on failure)
 */
export function createPinchZoom(target, options = {}) {
  return errorHandler.safeExecute(
    () => new PinchZoom(target, options),
    "creating PinchZoom instance",
    null
  );
}

/**
 * Safe PinchZoom creation function - Returns result object without throwing errors
 * @param {string|Element|NodeList} target - Target element
 * @param {Object} options - Options
 * @returns {Object} {success: boolean, instance: PinchZoom|null, error: string|null}
 */
export function safePinchZoom(target, options = {}) {
  try {
    const instance = new PinchZoom(target, options);
    return {
      success: true,
      instance,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      instance: null,
      error: error.message,
    };
  }
}

// Default export
export default PinchZoom;

// Make available as global object in browser environment
if (typeof window !== "undefined") {
  window.PinchZoom = PinchZoom;
  window.createPinchZoom = createPinchZoom;
}

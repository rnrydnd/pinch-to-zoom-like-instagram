/**
 * Error handling and logging utilities
 */

/**
 * Log level constants
 */
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

/**
 * Logger class for PinchZoom library
 */
export class Logger {
  constructor(prefix = "PinchZoom") {
    this.prefix = prefix;
    this.enabled = true;
  }

  /**
   * Enable/disable logging
   * @param {boolean} enabled - Whether logging is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Error log
   * @param {string} message - Error message
   * @param {...any} args - Additional arguments
   */
  error(message, ...args) {
    if (this.enabled && console.error) {
      console.error(`${this.prefix}: ${message}`, ...args);
    }
  }

  /**
   * Warning log
   * @param {string} message - Warning message
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    if (this.enabled && console.warn) {
      console.warn(`${this.prefix}: ${message}`, ...args);
    }
  }

  /**
   * Info log
   * @param {string} message - Info message
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    if (this.enabled && console.info) {
      console.info(`${this.prefix}: ${message}`, ...args);
    }
  }

  /**
   * Debug log
   * @param {string} message - Debug message
   * @param {...any} args - Additional arguments
   */
  debug(message, ...args) {
    if (this.enabled && console.debug) {
      console.debug(`${this.prefix}: ${message}`, ...args);
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Error handler class
 */
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger || new Logger();
    this.errorCounts = new Map(); // Track error occurrence count
    this.maxRetries = 3; // Maximum retry count
  }

  /**
   * Handle input validation errors
   * @param {string} message - Error message
   * @param {any} input - Invalid input value
   * @returns {boolean} Returns false to indicate processing should stop
   */
  handleValidationError(message, input) {
    this.logger.warn(`Validation Error: ${message}`, input);
    return false;
  }

  /**
   * Handle runtime errors
   * @param {string} operation - Operation that was being executed
   * @param {Error} error - Error that occurred
   * @param {any} context - Error context
   * @returns {boolean} Returns false to indicate processing should stop
   */
  handleRuntimeError(operation, error, context) {
    this.logger.error(
      `Runtime Error during ${operation}:`,
      error.message,
      context
    );
    return false;
  }

  /**
   * Handle initialization errors
   * @param {string} reason - Reason for initialization failure
   * @param {any} element - Problematic element
   * @returns {boolean} Returns false to indicate processing should stop
   */
  handleInitializationError(reason, element) {
    this.logger.warn(`Initialization failed: ${reason}`, element);
    return false;
  }

  /**
   * Handle configuration validation errors
   * @param {string} optionName - Invalid option name
   * @param {any} value - Invalid value
   * @param {any} defaultValue - Default value
   * @returns {any} Returns default value
   */
  handleConfigurationError(optionName, value, defaultValue) {
    this.logger.warn(
      `Invalid configuration for '${optionName}': ${value}. Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  /**
   * Handle warnings for non-image elements
   * @param {Element} element - Non-image element
   * @returns {boolean} Returns false to indicate processing should stop
   */
  handleNonImageWarning(element) {
    const tagName = element.tagName ? element.tagName.toLowerCase() : "unknown";
    this.logger.warn(
      `PinchZoom is designed for image elements. Found '${tagName}' element instead.`,
      element
    );
    return false;
  }

  /**
   * Handle retryable errors
   * @param {string} operation - Operation description
   * @param {Function} retryFn - Function to retry
   * @param {any} context - Context
   * @returns {any} Result on success, null on failure
   */
  handleRetryableError(operation, retryFn, context = null) {
    const key = `${operation}_${context ? context.toString() : "default"}`;
    const currentCount = this.errorCounts.get(key) || 0;

    if (currentCount >= this.maxRetries) {
      this.logger.error(
        `Max retries (${this.maxRetries}) exceeded for operation: ${operation}`
      );
      return null;
    }

    try {
      const result = retryFn();
      // Reset error count on success
      this.errorCounts.delete(key);
      return result;
    } catch (error) {
      this.errorCounts.set(key, currentCount + 1);
      this.logger.warn(
        `Retry ${currentCount + 1}/${
          this.maxRetries
        } failed for operation: ${operation}`,
        error.message
      );

      if (currentCount + 1 >= this.maxRetries) {
        this.logger.error(
          `All retries failed for operation: ${operation}`,
          error
        );
      }

      return null;
    }
  }

  /**
   * Safe function execution - Prevents application from crashing on errors
   * @param {Function} fn - Function to execute
   * @param {string} operation - Operation description
   * @param {any} fallback - Default value to return on error
   * @returns {any} Function execution result or fallback value
   */
  safeExecute(fn, operation, fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.handleRuntimeError(operation, error);
      return fallback;
    }
  }

  /**
   * Reset error statistics
   */
  resetErrorCounts() {
    this.errorCounts.clear();
  }

  /**
   * Return current error statistics
   * @returns {Object} Error statistics information
   */
  getErrorStats() {
    return {
      totalErrors: this.errorCounts.size,
      errors: Object.fromEntries(this.errorCounts),
      maxRetries: this.maxRetries,
    };
  }
}

/**
 * Default error handler instance
 */
export const errorHandler = new ErrorHandler(logger);

/**
 * 에러 처리 및 로깅 유틸리티
 */

/**
 * 로그 레벨 상수
 */
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

/**
 * PinchZoom 라이브러리의 로거 클래스
 */
export class Logger {
  constructor(prefix = "PinchZoom") {
    this.prefix = prefix;
    this.enabled = true;
  }

  /**
   * 로깅 활성화/비활성화
   * @param {boolean} enabled - 로깅 활성화 여부
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * 에러 로그
   * @param {string} message - 에러 메시지
   * @param {...any} args - 추가 인자들
   */
  error(message, ...args) {
    if (this.enabled && console.error) {
      console.error(`${this.prefix}: ${message}`, ...args);
    }
  }

  /**
   * 경고 로그
   * @param {string} message - 경고 메시지
   * @param {...any} args - 추가 인자들
   */
  warn(message, ...args) {
    if (this.enabled && console.warn) {
      console.warn(`${this.prefix}: ${message}`, ...args);
    }
  }

  /**
   * 정보 로그
   * @param {string} message - 정보 메시지
   * @param {...any} args - 추가 인자들
   */
  info(message, ...args) {
    if (this.enabled && console.info) {
      console.info(`${this.prefix}: ${message}`, ...args);
    }
  }

  /**
   * 디버그 로그
   * @param {string} message - 디버그 메시지
   * @param {...any} args - 추가 인자들
   */
  debug(message, ...args) {
    if (this.enabled && console.debug) {
      console.debug(`${this.prefix}: ${message}`, ...args);
    }
  }
}

/**
 * 기본 로거 인스턴스
 */
export const logger = new Logger();

/**
 * 에러 핸들러 클래스
 */
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger || new Logger();
    this.errorCounts = new Map(); // 에러 발생 횟수 추적
    this.maxRetries = 3; // 최대 재시도 횟수
  }

  /**
   * 입력 유효성 검사 에러 처리
   * @param {string} message - 에러 메시지
   * @param {any} input - 잘못된 입력값
   * @returns {boolean} false를 반환하여 처리 중단을 나타냄
   */
  handleValidationError(message, input) {
    this.logger.warn(`Validation Error: ${message}`, input);
    return false;
  }

  /**
   * 런타임 에러 처리
   * @param {string} operation - 실행 중이던 작업
   * @param {Error} error - 발생한 에러
   * @param {any} context - 에러 발생 컨텍스트
   * @returns {boolean} false를 반환하여 처리 중단을 나타냄
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
   * 초기화 에러 처리
   * @param {string} reason - 초기화 실패 이유
   * @param {any} element - 문제가 된 요소
   * @returns {boolean} false를 반환하여 처리 중단을 나타냄
   */
  handleInitializationError(reason, element) {
    this.logger.warn(`Initialization failed: ${reason}`, element);
    return false;
  }

  /**
   * 설정 검증 에러 처리
   * @param {string} optionName - 잘못된 옵션 이름
   * @param {any} value - 잘못된 값
   * @param {any} defaultValue - 기본값
   * @returns {any} 기본값 반환
   */
  handleConfigurationError(optionName, value, defaultValue) {
    this.logger.warn(
      `Invalid configuration for '${optionName}': ${value}. Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  /**
   * 이미지가 아닌 요소에 대한 경고 처리
   * @param {Element} element - 이미지가 아닌 요소
   * @returns {boolean} false를 반환하여 처리 중단을 나타냄
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
   * 재시도 가능한 에러 처리
   * @param {string} operation - 작업 설명
   * @param {Function} retryFn - 재시도할 함수
   * @param {any} context - 컨텍스트
   * @returns {any} 성공 시 결과, 실패 시 null
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
      // 성공 시 에러 카운트 리셋
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
   * 안전한 함수 실행 - 에러가 발생해도 애플리케이션이 중단되지 않도록 함
   * @param {Function} fn - 실행할 함수
   * @param {string} operation - 작업 설명
   * @param {any} fallback - 에러 발생 시 반환할 기본값
   * @returns {any} 함수 실행 결과 또는 fallback 값
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
   * 에러 통계 초기화
   */
  resetErrorCounts() {
    this.errorCounts.clear();
  }

  /**
   * 현재 에러 통계 반환
   * @returns {Object} 에러 통계 정보
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
 * 기본 에러 핸들러 인스턴스
 */
export const errorHandler = new ErrorHandler(logger);

/**
 * PinchZoom 라이브러리 - Instagram과 같은 핀치 줌 기능을 제공하는 바닐라 JavaScript 라이브러리
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
 * 기본 설정 옵션
 */
const DEFAULT_OPTIONS = {
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  maxScale: 5,
  minScale: 1,
  transitionDuration: "0.3s",
  zIndex: 1000,
};

/**
 * PinchZoom 메인 클래스
 */
export class PinchZoom {
  constructor(target, options = {}) {
    // DOM 환경 확인
    if (!isDOMReady()) {
      throw new Error(
        "PinchZoom requires a DOM environment. Make sure to initialize after DOM is ready."
      );
    }

    // 브라우저 호환성 확인
    this.compatibility = getBrowserCompatibility();
    this.legacyBrowser = detectLegacyBrowser();

    // 호환성 경고 출력
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

    // 호환성 권장사항 출력
    this.compatibility.recommendations.forEach((recommendation) => {
      logger.info(`Compatibility: ${recommendation}`);
    });

    // 입력 대상 검증
    const targetValidation = validateTarget(target);
    if (!targetValidation.isValid) {
      throw new Error(`Invalid target: ${targetValidation.error}`);
    }

    // 옵션 검증 및 정리
    const { sanitized: validatedOptions, errors } = validateAndSanitizeOptions(
      options,
      DEFAULT_OPTIONS
    );

    // 옵션 에러가 있으면 경고 출력
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

    // 자동 초기화
    this.init();
  }

  /**
   * PinchZoom을 초기화합니다
   */
  init() {
    if (this.isInitialized) {
      logger.warn("PinchZoom is already initialized");
      return this;
    }

    // 초기화 에러 목록 초기화
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
      // 요소 유효성 검사
      const imageValidation = validateImageElement(element);

      if (!imageValidation.isValid) {
        const error = `Element ${index + 1}: ${imageValidation.warning}`;
        this.initializationErrors.push(error);
        errorHandler.handleNonImageWarning(element);
        skipCount++;
        return;
      }

      // 경고가 있으면 출력하지만 계속 진행
      if (imageValidation.warning) {
        logger.warn(`Element ${index + 1}: ${imageValidation.warning}`);
      }

      // 요소 초기화 시도
      const success = this.initializeElement(element);
      if (success) {
        successCount++;
      } else {
        skipCount++;
      }
    });

    this.isInitialized = true;

    // 초기화 결과 로깅
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
   * 개별 요소에 PinchZoom을 초기화합니다
   * @param {Element} element - 초기화할 이미지 요소
   * @returns {boolean} 초기화 성공 여부
   */
  initializeElement(element) {
    return (
      errorHandler.handleRetryableError(
        "element initialization",
        () => {
          // 이미 초기화된 요소인지 확인
          if (element._pinchZoomInstance) {
            logger.warn("Element already has PinchZoom initialized", element);
            return false;
          }

          // 요소가 DOM에 연결되어 있는지 확인
          if (!document.contains(element)) {
            throw new Error("Element is not attached to the DOM");
          }

          // 컴포넌트 인스턴스 생성 (재시도 가능한 방식으로)
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

          // 터치 핸들러 콜백 설정
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

                // 스케일 제한 적용
                const clampedScale = Math.min(
                  Math.max(scaleFactor, this.options.minScale),
                  this.options.maxScale
                );

                // 줌 적용
                zoomController.applyTransform(clampedScale, 0, 0);

                // 오버레이 투명도 업데이트 (스케일에 비례)
                const opacity = Math.min(
                  (0.8 * (clampedScale - 1)) / (this.options.maxScale - 1),
                  0.8
                );
                overlayManager.updateOverlay(opacity);
              }, "handling touch move");
            },

            onTouchEnd: () => {
              errorHandler.safeExecute(() => {
                // 원래 상태로 복원
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

          // 이벤트 바인딩
          const bindingSuccess = errorHandler.safeExecute(
            () => touchHandler.bindEvents(),
            "binding touch events",
            false
          );

          if (!bindingSuccess) {
            throw new Error("Failed to bind touch events");
          }

          // 트랜지션 종료 이벤트 처리
          errorHandler.safeExecute(() => {
            zoomController.onTransitionEnd(() => {
              const state = zoomController.getTransformState();
              if (!state.isZoomed) {
                // 줌이 완전히 해제되었을 때 오버레이 숨김
                setTimeout(() => {
                  errorHandler.safeExecute(
                    () => overlayManager.updateOverlay(0),
                    "hiding overlay after transition"
                  );
                }, 50);
              }
            });
          }, "setting up transition end handler");

          // 인스턴스 정보 저장
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
   * 옵션을 업데이트합니다
   * @param {Object} newOptions - 새로운 옵션
   */
  updateOptions(newOptions) {
    if (!newOptions || typeof newOptions !== "object") {
      errorHandler.handleValidationError(
        "Invalid options provided",
        newOptions
      );
      return this;
    }

    // 새 옵션 검증
    const { sanitized: validatedOptions, errors } = validateAndSanitizeOptions(
      newOptions,
      this.options
    );

    // 검증 에러가 있으면 경고 출력
    if (errors.length > 0) {
      errors.forEach((error) => {
        errorHandler.handleConfigurationError(
          "updateOptions",
          error,
          "keeping current value"
        );
      });
    }

    // 유효한 옵션만 업데이트
    this.options = validatedOptions;

    // 각 인스턴스에 옵션 업데이트 적용
    let updateCount = 0;
    this.instances.forEach((instance, index) => {
      const success = errorHandler.safeExecute(
        () => {
          instance.options = { ...this.options };

          // 컴포넌트별 옵션 업데이트
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
   * PinchZoom을 제거하고 정리합니다
   */
  destroy() {
    this.instances.forEach((instance) => {
      const { element, touchHandler, zoomController, overlayManager } =
        instance;

      // 컴포넌트 정리
      touchHandler.destroy();
      zoomController.destroy();
      overlayManager.destroy();

      // 요소에서 인스턴스 참조 제거
      delete element._pinchZoomInstance;
    });

    this.instances = [];
    this.isInitialized = false;

    logger.info("PinchZoom destroyed");
    return this;
  }

  /**
   * 현재 상태 정보를 반환합니다
   * @returns {Object} 상태 정보
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
   * 초기화 에러 목록을 반환합니다
   * @returns {string[]} 에러 메시지 배열
   */
  getInitializationErrors() {
    return [...this.initializationErrors];
  }

  /**
   * 특정 요소의 PinchZoom 인스턴스를 반환합니다
   * @param {Element} element - 찾을 요소
   * @returns {Object|null} 인스턴스 또는 null
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
   * 라이브러리의 건강 상태를 확인합니다
   * @returns {Object} 건강 상태 정보
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
   * 건강 상태에 따른 권장사항을 생성합니다
   * @param {Array} activeInstances - 활성 인스턴스 배열
   * @param {number} orphanedInstances - 고아 인스턴스 수
   * @returns {string[]} 권장사항 배열
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
 * 팩토리 함수 - 간편한 사용을 위한 대안
 * @param {string|Element|NodeList} target - 대상 요소
 * @param {Object} options - 옵션
 * @returns {PinchZoom|null} PinchZoom 인스턴스 또는 null (실패 시)
 */
export function createPinchZoom(target, options = {}) {
  return errorHandler.safeExecute(
    () => new PinchZoom(target, options),
    "creating PinchZoom instance",
    null
  );
}

/**
 * 안전한 PinchZoom 생성 함수 - 에러를 던지지 않고 결과 객체를 반환
 * @param {string|Element|NodeList} target - 대상 요소
 * @param {Object} options - 옵션
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

// 기본 내보내기
export default PinchZoom;

// 브라우저 환경에서 전역 객체로 사용 가능하도록 설정
if (typeof window !== "undefined") {
  window.PinchZoom = PinchZoom;
  window.createPinchZoom = createPinchZoom;
}

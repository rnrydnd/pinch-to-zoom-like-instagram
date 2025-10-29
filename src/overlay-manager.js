/**
 * 배경 오버레이 관리를 담당하는 OverlayManager 클래스
 */

import { errorHandler } from "./error-handler.js";

export class OverlayManager {
  constructor(options = {}) {
    this.options = {
      backgroundColor: options.backgroundColor || "rgba(255, 255, 255, 0.8)",
      zIndex: options.zIndex || 999,
      ...options,
    };

    this.overlay = null;
    this.isVisible = false;
  }

  /**
   * 오버레이 요소를 생성합니다
   */
  createOverlay() {
    return errorHandler.safeExecute(
      () => {
        if (this.overlay) {
          return this.overlay;
        }

        this.overlay = document.createElement("div");
        this.overlay.id = "pinch-zoom-overlay";

        // 오버레이 스타일 설정
        const styles = {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0)", // 초기에는 투명
          pointerEvents: "none",
          zIndex: this.options.zIndex.toString(),
          transition: "background-color 0.1s ease-out",
          display: "none",
        };

        Object.assign(this.overlay.style, styles);

        // body에 추가
        document.body.appendChild(this.overlay);

        return this.overlay;
      },
      "creating overlay",
      null
    );
  }

  /**
   * 오버레이를 표시하고 투명도를 업데이트합니다
   * @param {number} opacity - 투명도 (0-1)
   */
  updateOverlay(opacity = 0) {
    return errorHandler.safeExecute(
      () => {
        if (!this.overlay) {
          this.createOverlay();
        }

        if (!this.overlay) {
          return false;
        }

        // 투명도 값 제한
        const clampedOpacity = Math.max(0, Math.min(1, opacity));

        if (clampedOpacity > 0) {
          // 오버레이 표시
          this.overlay.style.display = "block";
          this.isVisible = true;

          // 배경색에 투명도 적용
          const backgroundColor = this.parseBackgroundColor(
            this.options.backgroundColor,
            clampedOpacity
          );
          this.overlay.style.backgroundColor = backgroundColor;
        } else {
          // 오버레이 숨김
          this.overlay.style.backgroundColor = "rgba(255, 255, 255, 0)";

          // 약간의 지연 후 완전히 숨김
          setTimeout(() => {
            if (this.overlay && clampedOpacity === 0) {
              this.overlay.style.display = "none";
              this.isVisible = false;
            }
          }, 100);
        }

        return true;
      },
      "updating overlay",
      false
    );
  }

  /**
   * 배경색 문자열을 파싱하고 투명도를 적용합니다
   * @param {string} backgroundColor - 배경색 문자열
   * @param {number} opacity - 적용할 투명도
   * @returns {string} 투명도가 적용된 배경색 문자열
   */
  parseBackgroundColor(backgroundColor, opacity) {
    // rgba 형식인지 확인
    const rgbaMatch = backgroundColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );

    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // hex 형식 처리
    const hexMatch = backgroundColor.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      let r, g, b;

      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }

      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // 명명된 색상이나 기타 형식의 경우 기본값 사용
    return `rgba(255, 255, 255, ${opacity})`;
  }

  /**
   * 오버레이를 완전히 제거합니다
   */
  removeOverlay() {
    return errorHandler.safeExecute(
      () => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          this.overlay = null;
          this.isVisible = false;
        }
        return true;
      },
      "removing overlay",
      false
    );
  }

  /**
   * 오버레이 옵션을 업데이트합니다
   * @param {Object} newOptions - 새로운 옵션
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // 오버레이가 존재하면 z-index 업데이트
    if (this.overlay && newOptions.zIndex) {
      this.overlay.style.zIndex = newOptions.zIndex.toString();
    }
  }

  /**
   * 현재 오버레이 상태를 반환합니다
   * @returns {Object} 오버레이 상태 정보
   */
  getOverlayState() {
    return {
      isVisible: this.isVisible,
      exists: !!this.overlay,
      backgroundColor: this.options.backgroundColor,
      zIndex: this.options.zIndex,
    };
  }

  /**
   * OverlayManager를 정리합니다
   */
  destroy() {
    this.removeOverlay();
  }
}

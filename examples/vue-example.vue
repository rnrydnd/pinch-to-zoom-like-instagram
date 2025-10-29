<template>
  <div class="pinch-zoom-app">
    <h1>🔍 PinchZoom Vue Example</h1>

    <!-- Single image section -->
    <section class="section">
      <h2>📸 Single Image</h2>

      <!-- Settings controls -->
      <div class="controls">
        <h3>Settings</h3>
        <div class="control-group">
          <label>Background Color:</label>
          <input
            v-model="singleImageOptions.backgroundColor"
            type="text"
            placeholder="rgba(0, 0, 0, 0.8)"
          />
        </div>
        <div class="control-group">
          <label>Max Scale:</label>
          <input
            v-model.number="singleImageOptions.maxScale"
            type="range"
            min="2"
            max="10"
          />
          <span>{{ singleImageOptions.maxScale }}x</span>
        </div>
        <div class="control-group">
          <label>Transition Duration:</label>
          <select v-model="singleImageOptions.transitionDuration">
            <option value="0.1s">Fast (0.1s)</option>
            <option value="0.3s">Normal (0.3s)</option>
            <option value="0.5s">Slow (0.5s)</option>
            <option value="1s">Very Slow (1s)</option>
          </select>
        </div>
      </div>

      <!-- Single image component -->
      <ZoomableImage
        :src="'https://picsum.photos/600/400?random=10'"
        :alt="'Single Image Example'"
        :options="singleImageOptions"
        @initialized="onSingleImageInitialized"
        @error="onSingleImageError"
      />

      <div
        v-if="singleImageStatus"
        class="status"
        :class="singleImageStatus.type"
      >
        {{ singleImageStatus.message }}
      </div>
    </section>

    <!-- Gallery section -->
    <section class="section">
      <h2>🖼️ Image Gallery</h2>

      <!-- Gallery settings -->
      <div class="controls">
        <h3>Gallery Settings</h3>
        <div class="control-group">
          <label>Background Color:</label>
          <input
            v-model="galleryOptions.backgroundColor"
            type="text"
            placeholder="rgba(255, 255, 255, 0.9)"
          />
        </div>
        <div class="control-group">
          <label>Max Scale:</label>
          <input
            v-model.number="galleryOptions.maxScale"
            type="range"
            min="2"
            max="10"
          />
          <span>{{ galleryOptions.maxScale }}x</span>
        </div>
        <div class="control-group">
          <button @click="addGalleryImages" class="btn">➕ Add Images</button>
          <button @click="removeGalleryImages" class="btn">
            ➖ Remove Images
          </button>
          <button @click="showGalleryStats" class="btn">📊 Show Stats</button>
        </div>
      </div>

      <!-- Gallery component -->
      <ImageGallery
        :images="galleryImages"
        :options="galleryOptions"
        @stats-updated="onGalleryStatsUpdated"
      />

      <div v-if="galleryStats" class="stats">
        Gallery Stats: PinchZoom applied to {{ galleryStats.initialized }}/{{
          galleryStats.total
        }}
        images
      </div>
    </section>

    <!-- Advanced features section -->
    <section class="section">
      <h2>🔧 Advanced Features</h2>

      <div class="controls">
        <button @click="testErrorHandling" class="btn btn-warning">
          🧪 Error Handling Test
        </button>
        <button @click="performanceTest" class="btn btn-info">
          ⚡ Performance Test
        </button>
        <button @click="memoryTest" class="btn btn-secondary">
          🧠 Memory Test
        </button>
        <button @click="compatibilityTest" class="btn btn-primary">
          🌐 Compatibility Test
        </button>
      </div>

      <div v-if="testResults.length > 0" class="test-results">
        <h4>테스트 결과:</h4>
        <ul>
          <li
            v-for="result in testResults"
            :key="result.id"
            :class="result.type"
          >
            <strong>{{ result.name }}:</strong> {{ result.message }}
          </li>
        </ul>
      </div>
    </section>

    <!-- 사용법 안내 -->
    <section class="section info-section">
      <h3>💡 사용법</h3>
      <ul>
        <li>모바일 기기에서 두 손가락으로 이미지를 핀치하여 확대/축소</li>
        <li>위의 설정 컨트롤을 사용하여 실시간으로 옵션 변경 가능</li>
        <li>각 이미지는 독립적으로 PinchZoom이 적용됨</li>
        <li>컴포넌트가 파괴될 때 자동으로 정리됨</li>
      </ul>
    </section>
  </div>
</template>

<script>
import { PinchZoom, createPinchZoom, safePinchZoom } from "../src/index.js";

// 줌 가능한 이미지 컴포넌트
const ZoomableImage = {
  props: {
    src: String,
    alt: String,
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["initialized", "error"],
  data() {
    return {
      pinchZoom: null,
      isInitialized: false,
      error: null,
    };
  },
  mounted() {
    this.initializePinchZoom();
  },
  beforeUnmount() {
    this.destroyPinchZoom();
  },
  watch: {
    options: {
      handler() {
        this.updatePinchZoomOptions();
      },
      deep: true,
    },
    src() {
      this.reinitializePinchZoom();
    },
  },
  methods: {
    initializePinchZoom() {
      if (this.$refs.image) {
        const result = safePinchZoom(this.$refs.image, {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          maxScale: 4,
          transitionDuration: "0.3s",
          ...this.options,
        });

        if (result.success) {
          this.pinchZoom = result.instance;
          this.isInitialized = true;
          this.error = null;
          this.$emit("initialized", result.instance);
        } else {
          this.error = result.error;
          this.$emit("error", result.error);
        }
      }
    },
    destroyPinchZoom() {
      if (this.pinchZoom) {
        this.pinchZoom.destroy();
        this.pinchZoom = null;
        this.isInitialized = false;
      }
    },
    updatePinchZoomOptions() {
      if (this.pinchZoom) {
        this.pinchZoom.updateOptions(this.options);
      }
    },
    reinitializePinchZoom() {
      this.destroyPinchZoom();
      this.$nextTick(() => {
        this.initializePinchZoom();
      });
    },
  },
  template: `
    <div class="zoomable-image-container">
      <img
        ref="image"
        :src="src"
        :alt="alt"
        :style="{
          width: '100%',
          height: 'auto',
          cursor: isInitialized ? 'pointer' : 'default',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }"
        @load="initializePinchZoom"
      />
      <div v-if="error" class="error">
        PinchZoom 초기화 실패: {{ error }}
      </div>
    </div>
  `,
};

// 이미지 갤러리 컴포넌트
const ImageGallery = {
  props: {
    images: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["stats-updated"],
  data() {
    return {
      pinchZoom: null,
      stats: { total: 0, initialized: 0 },
    };
  },
  mounted() {
    this.initializeGallery();
  },
  beforeUnmount() {
    this.destroyGallery();
  },
  watch: {
    images: {
      handler() {
        this.reinitializeGallery();
      },
      deep: true,
    },
    options: {
      handler() {
        this.updateGalleryOptions();
      },
      deep: true,
    },
  },
  methods: {
    initializeGallery() {
      if (this.$refs.gallery && this.images.length > 0) {
        this.$nextTick(() => {
          const imageElements = this.$refs.gallery.querySelectorAll("img");

          if (imageElements.length > 0) {
            const result = safePinchZoom(imageElements, {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              maxScale: 5,
              ...this.options,
            });

            if (result.success) {
              this.pinchZoom = result.instance;
              const state = result.instance.getState();
              this.stats = {
                total: this.images.length,
                initialized: state.instanceCount,
              };
              this.$emit("stats-updated", this.stats);
            }
          }
        });
      }
    },
    destroyGallery() {
      if (this.pinchZoom) {
        this.pinchZoom.destroy();
        this.pinchZoom = null;
      }
    },
    updateGalleryOptions() {
      if (this.pinchZoom) {
        this.pinchZoom.updateOptions(this.options);
      }
    },
    reinitializeGallery() {
      this.destroyGallery();
      this.$nextTick(() => {
        this.initializeGallery();
      });
    },
  },
  template: `
    <div class="image-gallery">
      <div 
        ref="gallery"
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          padding: '20px'
        }"
      >
        <img
          v-for="(image, index) in images"
          :key="image.id || index"
          :src="image.src"
          :alt="image.alt || \`갤러리 이미지 \${index + 1}\`"
          :style="{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }"
        />
      </div>
    </div>
  `,
};

export default {
  name: "PinchZoomApp",
  components: {
    ZoomableImage,
    ImageGallery,
  },
  data() {
    return {
      singleImageOptions: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        maxScale: 4,
        transitionDuration: "0.3s",
      },
      galleryOptions: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        maxScale: 5,
      },
      galleryImages: [
        {
          id: 1,
          src: "https://picsum.photos/400/300?random=1",
          alt: "갤러리 이미지 1",
        },
        {
          id: 2,
          src: "https://picsum.photos/400/300?random=2",
          alt: "갤러리 이미지 2",
        },
        {
          id: 3,
          src: "https://picsum.photos/400/300?random=3",
          alt: "갤러리 이미지 3",
        },
        {
          id: 4,
          src: "https://picsum.photos/400/300?random=4",
          alt: "갤러리 이미지 4",
        },
        {
          id: 5,
          src: "https://picsum.photos/400/300?random=5",
          alt: "갤러리 이미지 5",
        },
        {
          id: 6,
          src: "https://picsum.photos/400/300?random=6",
          alt: "갤러리 이미지 6",
        },
      ],
      singleImageStatus: null,
      galleryStats: null,
      testResults: [],
    };
  },
  methods: {
    onSingleImageInitialized(instance) {
      this.singleImageStatus = {
        type: "success",
        message: "단일 이미지 PinchZoom이 성공적으로 초기화되었습니다.",
      };
      console.log("단일 이미지 PinchZoom 초기화됨:", instance);
    },
    onSingleImageError(error) {
      this.singleImageStatus = {
        type: "error",
        message: `단일 이미지 PinchZoom 초기화 실패: ${error}`,
      };
      console.error("단일 이미지 PinchZoom 초기화 실패:", error);
    },
    onGalleryStatsUpdated(stats) {
      this.galleryStats = stats;
    },
    addGalleryImages() {
      const newImages = [];
      for (let i = 0; i < 3; i++) {
        newImages.push({
          id: Date.now() + i,
          src: `https://picsum.photos/400/300?random=${Date.now() + i}`,
          alt: `새 갤러리 이미지 ${i + 1}`,
        });
      }
      this.galleryImages.push(...newImages);
    },
    removeGalleryImages() {
      if (this.galleryImages.length > 3) {
        this.galleryImages.splice(-3, 3);
      }
    },
    showGalleryStats() {
      if (this.galleryStats) {
        alert(
          `갤러리 통계:\n총 이미지: ${this.galleryStats.total}개\n초기화된 이미지: ${this.galleryStats.initialized}개`
        );
      }
    },
    testErrorHandling() {
      this.addTestResult(
        "에러 처리 테스트",
        "다양한 에러 상황을 테스트했습니다. 콘솔을 확인하세요.",
        "warning"
      );

      // 다양한 에러 상황 테스트
      console.log("=== 에러 처리 테스트 ===");

      const tests = [
        () => safePinchZoom("invalid[selector", {}),
        () => safePinchZoom(null, {}),
        () => safePinchZoom("#non-existent", {}),
        () => safePinchZoom("#single-image", { maxScale: "invalid" }),
      ];

      tests.forEach((test, index) => {
        const result = test();
        console.log(`테스트 ${index + 1}:`, result);
      });
    },
    performanceTest() {
      this.addTestResult("성능 테스트", "성능 테스트를 시작합니다...", "info");

      const startTime = performance.now();

      // 임시 이미지들 생성 및 초기화
      const testImages = [];
      for (let i = 0; i < 20; i++) {
        const img = document.createElement("img");
        img.src = `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`;
        img.className = "perf-test";
        document.body.appendChild(img);
        testImages.push(img);
      }

      const instance = createPinchZoom(".perf-test");
      const endTime = performance.now();

      // 정리
      if (instance) instance.destroy();
      testImages.forEach((img) => document.body.removeChild(img));

      const duration = endTime - startTime;
      this.addTestResult(
        "성능 테스트",
        `20개 이미지 초기화: ${duration.toFixed(2)}ms`,
        "success"
      );
    },
    memoryTest() {
      this.addTestResult(
        "메모리 테스트",
        "메모리 사용량을 테스트합니다...",
        "info"
      );

      if (performance.memory) {
        const memory = {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        };
        this.addTestResult(
          "메모리 테스트",
          `현재 메모리 사용량: ${memory.used}MB / ${memory.total}MB`,
          "info"
        );
      } else {
        this.addTestResult(
          "메모리 테스트",
          "이 브라우저에서는 메모리 정보를 사용할 수 없습니다.",
          "warning"
        );
      }
    },
    async compatibilityTest() {
      this.addTestResult(
        "호환성 테스트",
        "브라우저 호환성을 확인합니다...",
        "info"
      );

      try {
        const utils = await import("../src/utils.js");
        const compatibility = utils.getBrowserCompatibility();
        const legacyBrowser = utils.detectLegacyBrowser();

        console.log("브라우저 호환성:", compatibility);
        console.log("레거시 브라우저:", legacyBrowser);

        const supportLevel = legacyBrowser.isLegacy
          ? legacyBrowser.supportLevel
          : "full";
        const touchSupport = compatibility.touch.supported ? "✅" : "❌";
        const transformSupport = compatibility.transform.supported
          ? "✅"
          : "❌";

        this.addTestResult(
          "호환성 테스트",
          `지원 수준: ${supportLevel} | Touch: ${touchSupport} | Transform: ${transformSupport}`,
          "success"
        );
      } catch (error) {
        this.addTestResult(
          "호환성 테스트",
          `테스트 실패: ${error.message}`,
          "error"
        );
      }
    },
    addTestResult(name, message, type) {
      this.testResults.push({
        id: Date.now(),
        name,
        message,
        type,
      });

      // 최대 10개 결과만 유지
      if (this.testResults.length > 10) {
        this.testResults.shift();
      }
    },
  },
};
</script>

<style scoped>
.pinch-zoom-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}

.section {
  margin-bottom: 50px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin-top: 0;
  color: #555;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.controls h3 {
  margin-top: 0;
  color: #333;
}

.control-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.control-group label {
  min-width: 120px;
  font-weight: 500;
}

.control-group input,
.control-group select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107, #ff8c00);
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8, #007bff);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.status {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.stats {
  padding: 10px;
  background: #e7f3ff;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 14px;
  color: #0c5460;
}

.test-results {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.test-results h4 {
  margin-top: 0;
  color: #333;
}

.test-results ul {
  list-style: none;
  padding: 0;
}

.test-results li {
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 4px;
}

.test-results li.success {
  background: #d4edda;
  color: #155724;
}

.test-results li.error {
  background: #f8d7da;
  color: #721c24;
}

.test-results li.warning {
  background: #fff3cd;
  color: #856404;
}

.test-results li.info {
  background: #d1ecf1;
  color: #0c5460;
}

.info-section {
  background: linear-gradient(135deg, #e7f3ff, #f0f8ff);
  border-left: 4px solid #007bff;
}

.info-section h3 {
  color: #0056b3;
}

.error {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
  padding: 5px;
  background: #f8d7da;
  border-radius: 4px;
}

.zoomable-image-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>

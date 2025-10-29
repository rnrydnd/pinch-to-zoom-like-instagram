import React, { useEffect, useRef, useState } from "react";
import { PinchZoom, createPinchZoom, safePinchZoom } from "../src/index.js";

/**
 * 단일 줌 가능한 이미지 컴포넌트
 */
const ZoomableImage = ({
  src,
  alt,
  className = "",
  options = {},
  onInitialized = null,
  onError = null,
}) => {
  const imgRef = useRef(null);
  const pinchZoomRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (imgRef.current) {
      // 안전한 초기화 사용
      const result = safePinchZoom(imgRef.current, {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        maxScale: 4,
        transitionDuration: "0.3s",
        ...options,
      });

      if (result.success) {
        pinchZoomRef.current = result.instance;
        setIsInitialized(true);
        setError(null);

        if (onInitialized) {
          onInitialized(result.instance);
        }
      } else {
        setError(result.error);

        if (onError) {
          onError(result.error);
        }
      }
    }

    // 정리 함수
    return () => {
      if (pinchZoomRef.current) {
        pinchZoomRef.current.destroy();
        pinchZoomRef.current = null;
      }
    };
  }, [src, options]);

  return (
    <div className={`zoomable-image-container ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          cursor: isInitialized ? "pointer" : "default",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        onLoad={() => {
          // 이미지 로드 완료 후 재초기화 (필요한 경우)
          if (!isInitialized && imgRef.current) {
            const result = safePinchZoom(imgRef.current, options);
            if (result.success) {
              pinchZoomRef.current = result.instance;
              setIsInitialized(true);
            }
          }
        }}
      />
      {error && (
        <div
          style={{
            color: "red",
            fontSize: "12px",
            marginTop: "5px",
          }}
        >
          PinchZoom 초기화 실패: {error}
        </div>
      )}
    </div>
  );
};

/**
 * 이미지 갤러리 컴포넌트
 */
const ImageGallery = ({ images = [], galleryOptions = {}, className = "" }) => {
  const galleryRef = useRef(null);
  const pinchZoomRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, initialized: 0 });

  useEffect(() => {
    if (galleryRef.current && images.length > 0) {
      // 기존 인스턴스 정리
      if (pinchZoomRef.current) {
        pinchZoomRef.current.destroy();
      }

      // 이미지 로드 완료 대기
      const imageElements = galleryRef.current.querySelectorAll("img");
      const loadPromises = Array.from(imageElements).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
      });

      Promise.all(loadPromises).then(() => {
        // 갤러리에 PinchZoom 적용
        const result = safePinchZoom(imageElements, {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          maxScale: 5,
          ...galleryOptions,
        });

        if (result.success) {
          pinchZoomRef.current = result.instance;
          const state = result.instance.getState();
          setStats({
            total: images.length,
            initialized: state.instanceCount,
          });
        }
      });
    }

    return () => {
      if (pinchZoomRef.current) {
        pinchZoomRef.current.destroy();
        pinchZoomRef.current = null;
      }
    };
  }, [images, galleryOptions]);

  return (
    <div className={`image-gallery ${className}`}>
      <div
        ref={galleryRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          padding: "20px",
        }}
      >
        {images.map((image, index) => (
          <img
            key={image.id || index}
            src={image.src}
            alt={image.alt || `갤러리 이미지 ${index + 1}`}
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          padding: "10px 20px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        갤러리 통계: {stats.initialized}/{stats.total} 이미지에 PinchZoom 적용됨
      </div>
    </div>
  );
};

/**
 * PinchZoom 설정 컨트롤 컴포넌트
 */
const PinchZoomControls = ({ onOptionsChange = null, currentOptions = {} }) => {
  const [options, setOptions] = useState({
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    maxScale: 4,
    minScale: 1,
    transitionDuration: "0.3s",
    zIndex: 1000,
    ...currentOptions,
  });

  const handleOptionChange = (key, value) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);

    if (onOptionsChange) {
      onOptionsChange(newOptions);
    }
  };

  return (
    <div
      style={{
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>PinchZoom 설정</h3>

      <div style={{ display: "grid", gap: "15px" }}>
        <div>
          <label>배경색:</label>
          <input
            type="text"
            value={options.backgroundColor}
            onChange={(e) =>
              handleOptionChange("backgroundColor", e.target.value)
            }
            placeholder="rgba(0, 0, 0, 0.8)"
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>

        <div>
          <label>최대 확대 배율:</label>
          <input
            type="range"
            min="2"
            max="10"
            value={options.maxScale}
            onChange={(e) =>
              handleOptionChange("maxScale", parseInt(e.target.value))
            }
            style={{ marginLeft: "10px" }}
          />
          <span style={{ marginLeft: "10px" }}>{options.maxScale}x</span>
        </div>

        <div>
          <label>최소 확대 배율:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={options.minScale}
            onChange={(e) =>
              handleOptionChange("minScale", parseFloat(e.target.value))
            }
            style={{ marginLeft: "10px" }}
          />
          <span style={{ marginLeft: "10px" }}>{options.minScale}x</span>
        </div>

        <div>
          <label>전환 시간:</label>
          <select
            value={options.transitionDuration}
            onChange={(e) =>
              handleOptionChange("transitionDuration", e.target.value)
            }
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="0.1s">빠름 (0.1s)</option>
            <option value="0.3s">보통 (0.3s)</option>
            <option value="0.5s">느림 (0.5s)</option>
            <option value="1s">매우 느림 (1s)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * 메인 앱 컴포넌트
 */
const PinchZoomApp = () => {
  const [galleryOptions, setGalleryOptions] = useState({
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    maxScale: 4,
  });

  const [singleImageOptions, setSingleImageOptions] = useState({
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    maxScale: 3,
  });

  // 샘플 이미지 데이터
  const galleryImages = [
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
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        🔍 PinchZoom React 예제
      </h1>

      {/* 단일 이미지 섹션 */}
      <section style={{ marginBottom: "50px" }}>
        <h2>📸 단일 이미지</h2>
        <PinchZoomControls
          currentOptions={singleImageOptions}
          onOptionsChange={setSingleImageOptions}
        />
        <ZoomableImage
          src="https://picsum.photos/600/400?random=10"
          alt="단일 이미지 예제"
          options={singleImageOptions}
          onInitialized={(instance) => {
            console.log("단일 이미지 PinchZoom 초기화됨:", instance);
          }}
          onError={(error) => {
            console.error("단일 이미지 PinchZoom 초기화 실패:", error);
          }}
        />
      </section>

      {/* 갤러리 섹션 */}
      <section>
        <h2>🖼️ 이미지 갤러리</h2>
        <PinchZoomControls
          currentOptions={galleryOptions}
          onOptionsChange={setGalleryOptions}
        />
        <ImageGallery images={galleryImages} galleryOptions={galleryOptions} />
      </section>

      {/* 사용법 안내 */}
      <section
        style={{
          marginTop: "50px",
          padding: "20px",
          background: "#e7f3ff",
          borderRadius: "8px",
        }}
      >
        <h3>💡 사용법</h3>
        <ul>
          <li>모바일 기기에서 두 손가락으로 이미지를 핀치하여 확대/축소</li>
          <li>위의 설정 컨트롤을 사용하여 실시간으로 옵션 변경 가능</li>
          <li>각 이미지는 독립적으로 PinchZoom이 적용됨</li>
          <li>컴포넌트가 언마운트될 때 자동으로 정리됨</li>
        </ul>
      </section>
    </div>
  );
};

export default PinchZoomApp;

// 개별 컴포넌트들도 내보내기
export { ZoomableImage, ImageGallery, PinchZoomControls };

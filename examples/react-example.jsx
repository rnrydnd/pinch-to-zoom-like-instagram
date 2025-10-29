import React, { useEffect, useRef, useState } from "react";
import { PinchZoom, createPinchZoom, safePinchZoom } from "../src/index.js";

/**
 * Single zoomable image component
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
      // Use safe initialization
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

    // Cleanup function
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
          // Re-initialize after image load (if needed)
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
          PinchZoom initialization failed: {error}
        </div>
      )}
    </div>
  );
};

/**
 * Image gallery component
 */
const ImageGallery = ({ images = [], galleryOptions = {}, className = "" }) => {
  const galleryRef = useRef(null);
  const pinchZoomRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, initialized: 0 });

  useEffect(() => {
    if (galleryRef.current && images.length > 0) {
      // Clean up existing instance
      if (pinchZoomRef.current) {
        pinchZoomRef.current.destroy();
      }

      // Wait for image load completion
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
        // Apply PinchZoom to gallery
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
        Gallery stats: PinchZoom applied to {stats.initialized}/{stats.total}{" "}
        images
      </div>
    </div>
  );
};

/**
 * PinchZoom configuration control component
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
      <h3 style={{ marginTop: 0 }}>PinchZoom Settings</h3>

      <div style={{ display: "grid", gap: "15px" }}>
        <div>
          <label>Background Color:</label>
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
          <label>Max Scale:</label>
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
          <label>Min Scale:</label>
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
          <label>Transition Duration:</label>
          <select
            value={options.transitionDuration}
            onChange={(e) =>
              handleOptionChange("transitionDuration", e.target.value)
            }
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="0.1s">Fast (0.1s)</option>
            <option value="0.3s">Normal (0.3s)</option>
            <option value="0.5s">Slow (0.5s)</option>
            <option value="1s">Very Slow (1s)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Main app component
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

  // Sample image data
  const galleryImages = [
    {
      id: 1,
      src: "https://picsum.photos/400/300?random=1",
      alt: "Gallery Image 1",
    },
    {
      id: 2,
      src: "https://picsum.photos/400/300?random=2",
      alt: "Gallery Image 2",
    },
    {
      id: 3,
      src: "https://picsum.photos/400/300?random=3",
      alt: "Gallery Image 3",
    },
    {
      id: 4,
      src: "https://picsum.photos/400/300?random=4",
      alt: "Gallery Image 4",
    },
    {
      id: 5,
      src: "https://picsum.photos/400/300?random=5",
      alt: "Gallery Image 5",
    },
    {
      id: 6,
      src: "https://picsum.photos/400/300?random=6",
      alt: "Gallery Image 6",
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        🔍 PinchZoom React Example
      </h1>

      {/* Single image section */}
      <section style={{ marginBottom: "50px" }}>
        <h2>📸 Single Image</h2>
        <PinchZoomControls
          currentOptions={singleImageOptions}
          onOptionsChange={setSingleImageOptions}
        />
        <ZoomableImage
          src="https://picsum.photos/600/400?random=10"
          alt="Single Image Example"
          options={singleImageOptions}
          onInitialized={(instance) => {
            console.log("Single image PinchZoom initialized:", instance);
          }}
          onError={(error) => {
            console.error(
              "Single image PinchZoom initialization failed:",
              error
            );
          }}
        />
      </section>

      {/* Gallery section */}
      <section>
        <h2>🖼️ Image Gallery</h2>
        <PinchZoomControls
          currentOptions={galleryOptions}
          onOptionsChange={setGalleryOptions}
        />
        <ImageGallery images={galleryImages} galleryOptions={galleryOptions} />
      </section>

      {/* Usage guide */}
      <section
        style={{
          marginTop: "50px",
          padding: "20px",
          background: "#e7f3ff",
          borderRadius: "8px",
        }}
      >
        <h3>💡 Usage</h3>
        <ul>
          <li>
            Pinch images with two fingers on mobile devices to zoom in/out
          </li>
          <li>
            Use the settings controls above to change options in real-time
          </li>
          <li>Each image has PinchZoom applied independently</li>
          <li>Automatically cleaned up when component unmounts</li>
        </ul>
      </section>
    </div>
  );
};

export default PinchZoomApp;

// Export individual components as well
export { ZoomableImage, ImageGallery, PinchZoomControls };

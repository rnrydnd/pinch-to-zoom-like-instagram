import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

const baseConfig = {
  input: "src/index.js",
  plugins: [nodeResolve()],
  output: {
    format: "umd",
    name: "PinchZoom",
    exports: "auto",
  },
};

const configs = [];

if (isDevelopment) {
  // 개발용 빌드 (압축되지 않음)
  configs.push({
    ...baseConfig,
    output: {
      ...baseConfig.output,
      file: "dist/pinch-zoom-like-instagram.js",
      sourcemap: true,
    },
  });
}

if (isProduction) {
  // 프로덕션용 빌드 (압축됨)
  configs.push({
    ...baseConfig,
    plugins: [
      ...baseConfig.plugins,
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      }),
    ],
    output: {
      ...baseConfig.output,
      file: "dist/pinch-zoom-like-instagram.min.js",
      sourcemap: true,
    },
  });
}

export default configs;

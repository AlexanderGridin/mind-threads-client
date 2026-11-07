import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { forbidTestCode } from "./vite-plugins/forbid-test-code.plugin.ts";

const PUBLISHED_BASE_PATH = "/mind-threads-client/";

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  return {
    base: command === "build" || isPreview ? PUBLISHED_BASE_PATH : "/",
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      forbidTestCode(),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});

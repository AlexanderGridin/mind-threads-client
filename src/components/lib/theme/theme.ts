import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        nord: {
          0: { value: "#2e3440" },
          1: { value: "#3b4252" },
          2: { value: "#434c5e" },
          3: { value: "#4c566a" },
          4: { value: "#d8dee9" },
          5: { value: "#e5e9f0" },
          6: { value: "#eceff4" },
          7: { value: "#8fbcbb" },
          8: { value: "#88c0d0" },
          9: { value: "#81a1c1" },
          10: { value: "#5e81ac" },
          11: { value: "#bf616a" },
          12: { value: "#d08770" },
          13: { value: "#ebcb8b" },
          14: { value: "#a3be8c" },
          15: { value: "#b48ead" },
        },
        gray: {
          50: { value: "{colors.nord.6}" },
          100: { value: "{colors.nord.5}" },
          200: { value: "{colors.nord.4}" },
          300: { value: "{colors.nord.3}" },
          400: { value: "{colors.nord.3}" },
          500: { value: "{colors.nord.2}" },
          600: { value: "{colors.nord.2}" },
          700: { value: "{colors.nord.1}" },
          800: { value: "{colors.nord.1}" },
          900: { value: "{colors.nord.0}" },
          950: { value: "{colors.nord.0}" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "{colors.nord.6}", _dark: "{colors.nord.0}" },
          },
          subtle: {
            value: { _light: "{colors.nord.5}", _dark: "{colors.nord.1}" },
          },
          muted: {
            value: { _light: "{colors.nord.4}", _dark: "{colors.nord.2}" },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: "{colors.nord.0}", _dark: "{colors.nord.6}" },
          },
          muted: {
            value: { _light: "{colors.nord.3}", _dark: "{colors.nord.4}" },
          },
        },
        border: {
          DEFAULT: { value: { _light: "#c8d3de", _dark: "{colors.nord.3}" } },
          subtle: {
            value: { _light: "{colors.nord.4}", _dark: "{colors.nord.2}" },
          },
        },
        accent: {
          DEFAULT: {
            value: { _light: "{colors.nord.10}", _dark: "{colors.nord.8}" },
          },
          fg: {
            value: { _light: "{colors.nord.6}", _dark: "{colors.nord.0}" },
          },
          subtle: {
            value: { _light: "{colors.nord.9}", _dark: "{colors.nord.9}" },
          },
        },
        red: { DEFAULT: { value: "{colors.nord.11}" } },
        orange: { DEFAULT: { value: "{colors.nord.12}" } },
        yellow: { DEFAULT: { value: "{colors.nord.13}" } },
        green: { DEFAULT: { value: "{colors.nord.14}" } },
        purple: { DEFAULT: { value: "{colors.nord.15}" } },
      },
    },
  },
});

export const nordSystem = createSystem(defaultConfig, config);

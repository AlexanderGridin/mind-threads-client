import { describe, it, expect } from "vitest";
import { getContrastColorMode } from "../getContrastColorMode";

describe("getContrastColorMode", () => {
  it.each([
    ["#ffffff", "light"],
    ["#000000", "dark"],
    ["#ebcb8b", "light"],
    ["#2e3440", "dark"],
    ["#FF6B6B", "light"],
  ])(
    "returns the text color mode with more contrast for %s",
    (backgroundColor, expectedColorMode) => {
      const colorMode = getContrastColorMode(backgroundColor);
      expect(colorMode).toBe(expectedColorMode);
    }
  );
});

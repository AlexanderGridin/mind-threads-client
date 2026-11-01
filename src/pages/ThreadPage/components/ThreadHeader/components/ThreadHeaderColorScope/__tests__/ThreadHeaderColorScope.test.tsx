import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadHeaderColorScope } from "../ThreadHeaderColorScope";

const CHILD_TEXT = "Child";
const LIGHT_BACKGROUND_COLOR = "#ebcb8b";
const DARK_BACKGROUND_COLOR = "#2e3440";
const THEME_SCOPE_SELECTOR = ".chakra-theme";

const setup = (backgroundColor?: string) => {
  renderWithUIProvider(
    <ThreadHeaderColorScope backgroundColor={backgroundColor}>
      <p>{CHILD_TEXT}</p>
    </ThreadHeaderColorScope>
  );
};

describe("ThreadHeaderColorScope", () => {
  it("forces the light color mode scope for a light background", () => {
    setup(LIGHT_BACKGROUND_COLOR);

    const child = screen.getByText(CHILD_TEXT);
    const themeScope = child.closest(THEME_SCOPE_SELECTOR);

    expect(themeScope).toHaveClass("chakra-theme", "light");
  });

  it("forces the dark color mode scope for a dark background", () => {
    setup(DARK_BACKGROUND_COLOR);

    const child = screen.getByText(CHILD_TEXT);
    const themeScope = child.closest(THEME_SCOPE_SELECTOR);

    expect(themeScope).toHaveClass("chakra-theme", "dark");
  });

  it("adds no forced color scope without a background", () => {
    setup();

    const child = screen.getByText(CHILD_TEXT);
    const themeScope = child.closest(THEME_SCOPE_SELECTOR);

    expect(themeScope).toBeNull();
  });
});

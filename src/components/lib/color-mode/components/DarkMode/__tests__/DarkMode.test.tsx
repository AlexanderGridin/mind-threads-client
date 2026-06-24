import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { DarkMode } from "../DarkMode";
import { renderWithUIProvider } from "../../../../utils";

const setup = () => {
  return renderWithUIProvider(<DarkMode>Dark mode content</DarkMode>);
};

describe("DarkMode", () => {
  it("renders child content", () => {
    setup();

    expect(screen.getByText("Dark mode content")).toBeInTheDocument();
  });
});

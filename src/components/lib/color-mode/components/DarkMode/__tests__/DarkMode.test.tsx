import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { DarkMode } from "../DarkMode";
import { renderWithUIProvider } from "../../../../__test-fixtures__";

const setup = () => {
  return renderWithUIProvider(<DarkMode>Dark mode content</DarkMode>);
};

describe("DarkMode", () => {
  it("renders child content", async () => {
    setup();

    const content = await screen.findByText("Dark mode content");
    expect(content).toBeInTheDocument();
  });
});

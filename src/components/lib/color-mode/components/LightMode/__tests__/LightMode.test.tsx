import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { LightMode } from "../LightMode";
import { renderWithUIProvider } from "../../../../__test-fixtures__";

const setup = () => {
  return renderWithUIProvider(<LightMode>Light mode content</LightMode>);
};

describe("LightMode", () => {
  it("renders child content", async () => {
    setup();

    const content = await screen.findByText("Light mode content");
    expect(content).toBeInTheDocument();
  });
});

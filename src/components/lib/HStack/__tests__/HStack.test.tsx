import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { HStack, type HStackProps } from "../HStack";
import { renderWithUIProvider } from "../../utils";

const setup = (props: Partial<HStackProps> = {}) => {
  const defaultProps: HStackProps = {
    children: "HStack content",
    ...props,
  };

  renderWithUIProvider(<HStack {...defaultProps} />);
};

describe("HStack", () => {
  it("renders children", () => {
    setup({ children: "Stack content" });

    expect(screen.getByText("Stack content")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    setup({ children: "Test", "data-testid": "test-hstack" });

    expect(screen.getByTestId("test-hstack")).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { VStack, type VStackProps } from "../VStack";
import { renderWithUIProvider } from "../../utils";

const setup = (props: Partial<VStackProps> = {}) => {
  const defaultProps: VStackProps = {
    children: "VStack content",
    ...props,
  };

  renderWithUIProvider(<VStack {...defaultProps} />);
};

describe("VStack", () => {
  it("renders children", () => {
    setup({ children: "Stack content" });

    expect(screen.getByText("Stack content")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    setup({ children: "Test", "data-testid": "test-vstack" });

    expect(screen.getByTestId("test-vstack")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    setup({
      children: (
        <>
          <span>Item 1</span>
          <span>Item 2</span>
        </>
      ),
    });

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });
});

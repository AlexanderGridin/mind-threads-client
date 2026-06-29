import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { Text, type TextProps } from "../Text";
import { renderWithUIProvider } from "../../utils";

const setup = (props: Partial<TextProps> = {}) => {
  const defaultProps: TextProps = {
    children: "Text content",
    ...props,
  };

  renderWithUIProvider(<Text {...defaultProps} />);
};

describe("Text", () => {
  it("renders children", () => {
    setup({ children: "Hello world" });

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    setup({ children: "Test", "data-testid": "test-text" });

    expect(screen.getByTestId("test-text")).toBeInTheDocument();
  });

  it("renders with as prop", () => {
    setup({
      children: "Heading",
      as: "h1",
      "data-testid": "heading-text",
    });

    expect(
      screen.getByRole("heading", { level: 1, name: /heading/i })
    ).toBeInTheDocument();
  });
});

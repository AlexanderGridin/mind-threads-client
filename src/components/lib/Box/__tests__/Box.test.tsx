import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Box, type BoxProps } from "../Box";
import { renderWithUIProvider } from "../../__test-fixtures__";

const mockOnClick = vi.fn();

const setup = (props: Omit<Partial<BoxProps>, "onClick"> = {}) => {
  const user = userEvent.setup();
  renderWithUIProvider(<Box {...props} onClick={mockOnClick} />);
  return { user };
};

describe("Box", () => {
  it("renders children", () => {
    setup({ children: "Box content" });

    expect(screen.getByText("Box content")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    setup({ children: "Test", "data-testid": "test-box" });

    expect(screen.getByTestId("test-box")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const { user } = setup({ children: "Click me" });

    const box = screen.getByText("Click me");
    await user.click(box);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type Ref } from "react";

import { Box, type BoxProps } from "../Box";
import { renderWithUIProvider } from "../../__test-fixtures__";

const mockOnClick = vi.fn();

const setup = ({
  ref,
  ...props
}: Omit<Partial<BoxProps>, "onClick"> & { ref?: Ref<HTMLDivElement> } = {}) => {
  const user = userEvent.setup();
  renderWithUIProvider(<Box {...props} ref={ref} onClick={mockOnClick} />);
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

  it("forwards the ref to the rendered element", () => {
    const ref = createRef<HTMLDivElement>();

    setup({ ref, children: "Ref box", "data-testid": "ref-box" });

    const box = screen.getByTestId("ref-box");
    expect(ref.current).toBe(box);
  });

  it("renders as a button with the given type and aria-current", () => {
    setup({
      as: "button",
      type: "button",
      "aria-current": true,
      children: "Select section",
    });

    const button = screen.getByRole("button", { name: "Select section" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-current", "true");
  });
});

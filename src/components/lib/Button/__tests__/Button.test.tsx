import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button, type ButtonProps } from "../Button";
import { renderWithUIProvider } from "../../utils";

const setup = ({
  onClick = vi.fn(),
  children = "Click me",
}: Partial<ButtonProps> = {}) => {
  const user = userEvent.setup();

  const renderResult = renderWithUIProvider(
    <Button onClick={onClick}>{children}</Button>
  );

  return { user, ...renderResult };
};

describe("Button", () => {
  it("renders with children", () => {
    setup();

    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const mockOnClick = vi.fn();
    const { user } = setup({ onClick: mockOnClick });

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);
    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it("renders multiple children correctly", () => {
    setup({
      children: (
        <>
          <span>Icon</span>
          <span>Label</span>
        </>
      ),
    });

    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });
});

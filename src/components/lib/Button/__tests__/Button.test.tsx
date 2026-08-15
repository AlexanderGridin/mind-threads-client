import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button, type ButtonProps } from "../Button";
import { renderWithUIProvider } from "../../utils";

const setup = ({
  onClick = vi.fn(),
  children = "Click me",
  "data-testid": dataTestId,
  disabled = false,
}: Partial<ButtonProps> = {}) => {
  const user = userEvent.setup();

  const renderResult = renderWithUIProvider(
    <Button disabled={disabled} onClick={onClick} data-testid={dataTestId}>
      {children}
    </Button>
  );

  return { user, ...renderResult };
};

describe("Button", () => {
  const getButton = () => screen.getByRole("button", { name: /click me/i });

  it("renders with children", () => {
    setup();
    expect(getButton()).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const mockOnClick = vi.fn();
    const { user } = setup({ onClick: mockOnClick });

    const button = getButton();
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

  it("accepts and applies data-testid prop", () => {
    setup({ "data-testid": "test-button" });
    expect(screen.getByTestId("test-button")).toBeInTheDocument();
  });

  it("accepts disabled prop", () => {
    setup({ disabled: true });

    const button = getButton();
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});

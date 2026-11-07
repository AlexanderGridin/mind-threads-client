import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IconButton, type IconButtonProps } from "../IconButton";
import { renderWithUIProvider } from "../../__test-fixtures__";

const mockOnClick = vi.fn();

const setup = (props: Omit<Partial<IconButtonProps>, "onClick"> = {}) => {
  const user = userEvent.setup();

  const defaultProps: Omit<IconButtonProps, "onClick"> = {
    "aria-label": "Test button",
    children: "🔘",
    ...props,
  };

  renderWithUIProvider(
    <IconButton {...(defaultProps as IconButtonProps)} onClick={mockOnClick} />
  );

  return { user };
};

describe("IconButton", () => {
  it("renders children", () => {
    setup({ children: "Icon" });

    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("applies aria-label", () => {
    setup({ "aria-label": "Delete item" });

    expect(
      screen.getByRole("button", { name: /delete item/i })
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const { user } = setup({ "aria-label": "Click me" });

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it("applies data-testid", () => {
    setup({ "data-testid": "icon-button-test" });

    expect(screen.getByTestId("icon-button-test")).toBeInTheDocument();
  });
});

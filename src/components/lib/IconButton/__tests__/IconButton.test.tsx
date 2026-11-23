import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IconButton, type IconButtonProps } from "../IconButton";
import { renderWithUIProvider } from "../../__test-fixtures__";

const mockOnClick = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

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

  it.each([
    { pressed: true, expected: "true" },
    { pressed: false, expected: "false" },
  ])(
    "sets aria-pressed to $expected when aria-pressed is $pressed",
    ({ pressed, expected }) => {
      setup({ "aria-label": "Tag", "aria-pressed": pressed });

      const button = screen.getByRole("button", { name: "Tag" });
      expect(button).toHaveAttribute("aria-pressed", expected);
    }
  );

  it("is disabled when disabled is set", async () => {
    const { user } = setup({ "aria-label": "Disabled", disabled: true });

    const button = screen.getByRole("button", { name: "Disabled" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies height, minWidth, and px as styles", () => {
    setup({
      "aria-label": "Remove",
      height: "4",
      minWidth: "4",
      px: "0",
    });

    const button = screen.getByRole("button", { name: "Remove" });
    expect(button).toHaveStyle({
      height: "var(--chakra-sizes-4)",
      minWidth: "var(--chakra-sizes-4)",
      paddingInline: "0",
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input, type InputProps } from "../Input";
import { renderWithUIProvider } from "../../utils";

const setup = ({
  value = "",
  onChange = vi.fn(),
  ...props
}: Partial<InputProps> = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(<Input value={value} onChange={onChange} {...props} />);

  return { user };
};

describe("Input", () => {
  it("renders with the given value", () => {
    setup({ value: "test value" });

    expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
  });

  it("renders placeholder when provided", () => {
    setup({ placeholder: "Enter text here" });

    expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
  });

  it("calls onChange with the typed string when the user types", async () => {
    const mockOnChange = vi.fn();
    const { user } = setup({ onChange: mockOnChange });

    const input = screen.getByRole("textbox");
    await user.type(input, "hello");

    expect(mockOnChange).toHaveBeenCalledWith("h");
    expect(mockOnChange).toHaveBeenCalledWith("e");
    expect(mockOnChange).toHaveBeenCalledWith("l");
    expect(mockOnChange).toHaveBeenCalledWith("l");
    expect(mockOnChange).toHaveBeenCalledWith("o");
  });

  it("applies data-testid", () => {
    setup({ "data-testid": "custom-input" });

    expect(screen.getByTestId("custom-input")).toBeInTheDocument();
  });

  it("applies disabled attribute correctly", () => {
    setup({ disabled: true });

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});

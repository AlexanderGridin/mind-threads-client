import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type Ref } from "react";

import { Input, type InputProps } from "../Input";
import { renderWithUIProvider } from "../../__test-fixtures__";
import {
  INPUT_ERROR_TEXT_TEST_ID,
  INPUT_LABEL_TEST_ID,
  INPUT_REQUIRED_INDICATOR_TEST_ID,
} from "../Input.constants";

const TEST_ID = "custom-input";
const ERROR_TEXT = "Enter a valid value";
const ARIA_LABEL = "Tag name";

const mockOnChange = vi.fn();
const mockOnKeyDown = vi.fn();
const mockOnBlur = vi.fn();

const setup = ({
  value = "",
  onChange = mockOnChange,
  ref,
  ...props
}: Partial<InputProps> & { ref?: Ref<HTMLInputElement> } = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <Input ref={ref} value={value} onChange={onChange} {...props} />
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Input", () => {
  it("renders with the given value", () => {
    setup({ value: "test value" });

    expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
    expect(screen.queryByTestId(INPUT_LABEL_TEST_ID)).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(INPUT_REQUIRED_INDICATOR_TEST_ID)
    ).not.toBeInTheDocument();
  });

  it("renders with the given label", () => {
    setup({ label: "Input" });

    const label = screen.getByTestId(INPUT_LABEL_TEST_ID);

    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe("Input");
    expect(label.tagName).toBe("LABEL");

    expect(
      screen.queryByTestId(INPUT_REQUIRED_INDICATOR_TEST_ID)
    ).not.toBeInTheDocument();
  });

  it("renders with the given label and a required indicator when required", () => {
    setup({ label: "Input", required: true });

    const label = screen.getByTestId(INPUT_LABEL_TEST_ID);

    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe("Input *");

    expect(
      within(label).getByTestId(INPUT_REQUIRED_INDICATOR_TEST_ID)
    ).toBeInTheDocument();
  });

  it("renders placeholder when provided", () => {
    setup({ placeholder: "Enter text here" });
    expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    setup({ "data-testid": TEST_ID, label: "Input", required: true });

    expect(screen.getByTestId(TEST_ID)).toBeInTheDocument();

    expect(
      screen.getByTestId(`${TEST_ID}__${INPUT_LABEL_TEST_ID}`)
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${TEST_ID}__${INPUT_REQUIRED_INDICATOR_TEST_ID}`)
    ).toBeInTheDocument();
  });

  it("applies disabled attribute correctly", () => {
    setup({ disabled: true });

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("calls onChange with the typed string when the user types", async () => {
    const { user } = setup({ onChange: mockOnChange });

    const input = screen.getByRole("textbox");
    await user.type(input, "hello");

    expect(mockOnChange).toHaveBeenCalledWith("h");
    expect(mockOnChange).toHaveBeenCalledWith("e");
    expect(mockOnChange).toHaveBeenCalledWith("l");
    expect(mockOnChange).toHaveBeenCalledWith("l");
    expect(mockOnChange).toHaveBeenCalledWith("o");
  });

  it("forwards the ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();

    setup({ ref });

    const input = screen.getByRole("textbox");
    expect(ref.current).toBe(input);
  });

  it("shows errorText with the error test ID and marks the input invalid", () => {
    setup({ errorText: ERROR_TEXT, "data-testid": TEST_ID });

    const errorText = screen.getByTestId(
      `${TEST_ID}__${INPUT_ERROR_TEXT_TEST_ID}`
    );

    const input = screen.getByTestId(TEST_ID);

    expect(errorText).toBeInTheDocument();
    expect(errorText.textContent).toBe(ERROR_TEXT);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("shows no error text and is not invalid when errorText is empty", () => {
    setup({ errorText: "", "data-testid": TEST_ID });

    const errorText = screen.queryByTestId(
      `${TEST_ID}__${INPUT_ERROR_TEXT_TEST_ID}`
    );

    const input = screen.getByTestId(TEST_ID);

    expect(errorText).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("calls onKeyDown with the pressed key", async () => {
    const { user } = setup({ onKeyDown: mockOnKeyDown });

    const input = screen.getByRole("textbox");
    await user.type(input, "{Enter}");

    expect(mockOnKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: "Enter" })
    );
  });

  it("calls onBlur when focus leaves the input", async () => {
    const { user } = setup({ onBlur: mockOnBlur });

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it("focuses the input on mount with autoFocus", () => {
    setup({ autoFocus: true });

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });

  it("exposes aria-label as the accessible name", () => {
    setup({ "aria-label": ARIA_LABEL });

    const input = screen.getByRole("textbox", { name: ARIA_LABEL });
    expect(input).toBeInTheDocument();
  });
});

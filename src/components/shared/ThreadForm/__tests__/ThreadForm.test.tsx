import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  ColorPickerTestId,
  NORD_AURORA_SWATCHES,
} from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadForm } from "../ThreadForm";
import { ThreadFormTestId } from "../ThreadForm.constants";
import { vi } from "vitest";
import type { ThreadFormValue } from "../ThreadForm.types";
import { parseColor } from "@chakra-ui/react";

const mockColor = NORD_AURORA_SWATCHES[0];
const mockOnChange = vi.fn();

const setup = ({
  value = { color: mockColor, title: "" },
  disabled = false,
}: {
  value?: ThreadFormValue;
  disabled?: boolean;
} = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadForm value={value} disabled={disabled} onChange={mockOnChange} />
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ThreadForm", () => {
  it("renders properly", () => {
    setup({ value: { title: "Test Thread", color: mockColor } });

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    expect(titleInput).toHaveValue("Test Thread");

    const colorTrigger = screen.getByTestId(ColorPickerTestId.trigger);
    expect(colorTrigger).toBeInTheDocument();

    expect(colorTrigger.firstChild).toHaveAttribute(
      "data-value",
      mockColor.toUpperCase()
    );
  });

  it("calls onChange with updated title when typing in title input", async () => {
    const { user } = setup({ value: { title: "", color: mockColor } });

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "N");

    expect(mockOnChange).toHaveBeenCalledWith({
      title: "N",
      color: mockColor,
    });
  });

  it("calls onChange with updated color when color is changed", async () => {
    const { user } = setup({ value: { title: "", color: mockColor } });

    const colorTrigger = screen.getByTestId(ColorPickerTestId.trigger);
    await user.click(colorTrigger);

    const colorSwatch = screen.queryAllByTestId(
      ColorPickerTestId.swatchTrigger
    )[1];

    await user.click(colorSwatch);

    expect(mockOnChange).toHaveBeenCalledWith({
      title: "",
      color: parseColor(NORD_AURORA_SWATCHES[1]).toString("hex"),
    });
  });

  it("disables the name input and the color trigger when disabled", () => {
    setup({ disabled: true });

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    expect(titleInput).toBeDisabled();

    const colorTrigger = screen.getByTestId(ColorPickerTestId.trigger);
    expect(colorTrigger).toBeDisabled();
  });

  it("does not call onChange when the disabled name input is typed in or the disabled color trigger is clicked", async () => {
    const { user } = setup({ disabled: true });

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "N");

    const colorTrigger = screen.getByTestId(ColorPickerTestId.trigger);
    await user.click(colorTrigger);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("enables the name input and the color trigger by default", () => {
    setup();

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    expect(titleInput).toBeEnabled();

    const colorTrigger = screen.getByTestId(ColorPickerTestId.trigger);
    expect(colorTrigger).toBeEnabled();
  });
});

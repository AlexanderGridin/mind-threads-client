import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import {
  ColorPickerTestId,
  NORD_AURORA_SWATCHES,
} from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadForm } from "../ThreadForm";
import { ThreadFormTestId } from "../ThreadForm.constants";
import { vi } from "vitest";
import type { ThreadFormValue } from "../../../AddNewThreadModal.types";
import { parseColor } from "@chakra-ui/react";

const mockColor = NORD_AURORA_SWATCHES[0];
const mockOnChange = vi.fn();

const setup = (value?: ThreadFormValue) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadForm
      value={value ?? { color: mockColor, title: "" }}
      onChange={mockOnChange}
    />
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ThreadForm", () => {
  it("renders properly", () => {
    setup({ title: "Test Thread", color: mockColor });

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
    const { user } = setup({ title: "", color: mockColor });

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "N");

    expect(mockOnChange).toHaveBeenCalledWith({
      title: "N",
      color: mockColor,
    });
  });

  it("calls onChange with updated color when color is changed", async () => {
    const { user } = setup({ title: "", color: mockColor });

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
});

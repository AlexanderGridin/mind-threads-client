import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ColorPicker, type ColorPickerProps } from "../ColorPicker";
import { renderWithUIProvider } from "../../utils";
import {
  ColorPickerTestId,
  NORD_AURORA_SWATCHES,
} from "../ColorPicker.constants";
import { parseColor } from "@chakra-ui/react";

const setup = ({
  label = "Color",
  value = "#bf616a",
  onChange = vi.fn(),
}: Partial<ColorPickerProps> = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ColorPicker label={label} value={value} onChange={onChange} />
  );

  return { user };
};

describe("ColorPicker", () => {
  const labelText = "Accent color";

  it("should render properly when a color selection is not triggered", () => {
    setup({ label: labelText });

    const label = screen.getByTestId(ColorPickerTestId.label);
    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe(labelText);

    const trigger = screen.getByTestId(ColorPickerTestId.trigger);
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeEnabled();

    const content = screen.getByTestId(ColorPickerTestId.content);
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("hidden", "");

    const colorArea = screen.getByTestId(ColorPickerTestId.colorArea);
    expect(colorArea).toBeInTheDocument();

    const slider = screen.getByTestId(ColorPickerTestId.slider);
    expect(slider).toBeInTheDocument();

    const swatches = screen.getByTestId(ColorPickerTestId.swatches);
    expect(swatches).toBeInTheDocument();

    const swatchTriggers = screen.getAllByTestId(
      ColorPickerTestId.swatchTrigger
    );

    expect(swatchTriggers.length).toBe(NORD_AURORA_SWATCHES.length);

    const swatchValues = screen.getAllByTestId(ColorPickerTestId.swatchValue);
    expect(swatchValues.length).toBe(NORD_AURORA_SWATCHES.length);
  });

  it("should render properly when a color selection is triggered", async () => {
    const { user } = setup({ label: labelText });

    const content = screen.getByTestId(ColorPickerTestId.content);
    expect(content).toHaveAttribute("hidden", "");

    const trigger = screen.getByTestId(ColorPickerTestId.trigger);
    await user.click(trigger);

    expect(content).not.toHaveAttribute("hidden");
  });

  it("calls onChange when a swatch trigger is clicked", async () => {
    const mockOnChange = vi.fn();
    const { user } = setup({ onChange: mockOnChange });

    const trigger = screen.getByTestId(ColorPickerTestId.trigger);
    await user.click(trigger);

    const swatchTrigger = screen.getAllByTestId(
      ColorPickerTestId.swatchTrigger
    )[1];

    await user.click(swatchTrigger);

    expect(mockOnChange).toHaveBeenCalledWith(
      parseColor(NORD_AURORA_SWATCHES[1]).toString()
    );
  });
});

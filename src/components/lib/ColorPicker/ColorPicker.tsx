import {
  ColorPicker as ChakraColorPicker,
  Portal,
  parseColor,
  type ColorPickerValueChangeDetails,
} from "@chakra-ui/react";
import {
  ColorPickerTestId,
  NORD_AURORA_SWATCHES,
} from "./ColorPicker.constants";

export type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const handleValueChange = (details: ColorPickerValueChangeDetails) => {
    onChange(details.valueAsString);
  };

  return (
    <ChakraColorPicker.Root
      value={parseColor(value)}
      onValueChange={handleValueChange}
    >
      <ChakraColorPicker.HiddenInput />

      <ChakraColorPicker.Label data-testid={ColorPickerTestId.label}>
        {label}
      </ChakraColorPicker.Label>

      <ChakraColorPicker.Control>
        <ChakraColorPicker.Trigger
          data-testid={ColorPickerTestId.trigger}
          _hover={{ cursor: "pointer" }}
        />
      </ChakraColorPicker.Control>

      <Portal>
        <ChakraColorPicker.Positioner>
          <ChakraColorPicker.Content data-testid={ColorPickerTestId.content}>
            <ChakraColorPicker.Area data-testid={ColorPickerTestId.colorArea} />

            <ChakraColorPicker.ChannelSlider
              channel="hue"
              data-testid={ColorPickerTestId.slider}
            />

            <ChakraColorPicker.SwatchGroup
              data-testid={ColorPickerTestId.swatches}
            >
              {NORD_AURORA_SWATCHES.map((swatch) => (
                <ChakraColorPicker.SwatchTrigger
                  data-testid={ColorPickerTestId.swatchTrigger}
                  key={swatch}
                  value={swatch}
                  _hover={{ cursor: "pointer" }}
                >
                  <ChakraColorPicker.Swatch
                    data-testid={ColorPickerTestId.swatchValue}
                    value={swatch}
                  />
                </ChakraColorPicker.SwatchTrigger>
              ))}
            </ChakraColorPicker.SwatchGroup>
          </ChakraColorPicker.Content>
        </ChakraColorPicker.Positioner>
      </Portal>
    </ChakraColorPicker.Root>
  );
};

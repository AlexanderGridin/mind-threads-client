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

import styles from "./ColorPicker.module.css";

export type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  "data-testid"?: string;
  portal?: boolean;
  fullWidth?: boolean;
};

export const ColorPicker = ({
  label,
  value,
  "data-testid": testId,
  portal = true,
  fullWidth = false,
  onChange,
}: ColorPickerProps) => {
  const width = fullWidth ? "100%" : undefined;

  const handleValueChange = (details: ColorPickerValueChangeDetails) => {
    onChange(details.value.toString("hex"));
  };

  const content = (
    <ChakraColorPicker.Positioner>
      <ChakraColorPicker.Content data-testid={ColorPickerTestId.content}>
        <ChakraColorPicker.Area data-testid={ColorPickerTestId.colorArea} />

        <ChakraColorPicker.ChannelSlider
          channel="hue"
          data-testid={ColorPickerTestId.slider}
        />

        <ChakraColorPicker.SwatchGroup data-testid={ColorPickerTestId.swatches}>
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
  );

  return (
    <ChakraColorPicker.Root
      data-testid={testId || ColorPickerTestId.container}
      value={parseColor(value).toFormat("hsba")}
      width={width}
      onValueChange={handleValueChange}
    >
      <ChakraColorPicker.HiddenInput />

      <ChakraColorPicker.Label data-testid={ColorPickerTestId.label}>
        {label}
      </ChakraColorPicker.Label>

      <ChakraColorPicker.Control>
        <ChakraColorPicker.Trigger
          data-testid={ColorPickerTestId.trigger}
          className={styles.trigger}
          width={width}
          _hover={{ borderColor: "accent", cursor: "pointer" }}
          _focus={{ borderColor: "accent", outlineColor: "accent" }}
        />
      </ChakraColorPicker.Control>

      {portal ? <Portal>{content}</Portal> : content}
    </ChakraColorPicker.Root>
  );
};

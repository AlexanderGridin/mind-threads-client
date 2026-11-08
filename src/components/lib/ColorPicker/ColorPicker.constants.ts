import { initTestIdCreator } from "../utils";

export const NORD_AURORA_SWATCHES = [
  "#bf616a",
  "#d08770",
  "#ebcb8b",
  "#a3be8c",
  "#b48ead",
];

export const DEFAULT_SWATCH_COLOR = NORD_AURORA_SWATCHES[3];

const createTestId = initTestIdCreator("ColorPicker__");

export const ColorPickerTestId = {
  container: createTestId("container"),
  label: createTestId("label"),
  trigger: createTestId("trigger"),
  content: createTestId("content"),
  colorArea: createTestId("color-area"),
  slider: createTestId("slider"),
  swatches: createTestId("swatches"),
  swatchTrigger: createTestId("swatch-trigger"),
  swatchValue: createTestId("swatch-value"),
};

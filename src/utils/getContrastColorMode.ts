import type { ColorMode } from "@/components/lib";

// The theme's `fg` color in light mode (nord 0) and in dark mode (nord 6).
const LIGHT_MODE_TEXT_COLOR = "#2e3440";
const DARK_MODE_TEXT_COLOR = "#eceff4";

type GetContrastRatioParams = {
  firstColor: string;
  secondColor: string;
};

const getChannelLuminance = (channel: number) => {
  const value = channel / 255;

  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const getRelativeLuminance = (hexColor: string) => {
  const hex = hexColor.replace("#", "");

  const [red, green, blue] = [0, 2, 4].map((offset) => {
    return parseInt(hex.slice(offset, offset + 2), 16);
  });

  return (
    0.2126 * getChannelLuminance(red) +
    0.7152 * getChannelLuminance(green) +
    0.0722 * getChannelLuminance(blue)
  );
};

const getContrastRatio = ({
  firstColor,
  secondColor,
}: GetContrastRatioParams) => {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  const lighterLuminance = Math.max(firstLuminance, secondLuminance);
  const darkerLuminance = Math.min(firstLuminance, secondLuminance);

  return (lighterLuminance + 0.05) / (darkerLuminance + 0.05);
};

export const getContrastColorMode = (backgroundColor: string): ColorMode => {
  const darkTextContrast = getContrastRatio({
    firstColor: backgroundColor,
    secondColor: LIGHT_MODE_TEXT_COLOR,
  });

  const lightTextContrast = getContrastRatio({
    firstColor: backgroundColor,
    secondColor: DARK_MODE_TEXT_COLOR,
  });

  return darkTextContrast >= lightTextContrast ? "light" : "dark";
};

import { LuMoon, LuSun } from "react-icons/lu";

import { useColorMode } from "../../color-mode.hooks";
import { ColorModeIconTestId } from "./ColorModeIcon.constants";

export const ColorModeIcon = () => {
  const { colorMode } = useColorMode();

  return colorMode === "dark" ? (
    <LuMoon data-testid={ColorModeIconTestId.darkIcon} />
  ) : (
    <LuSun data-testid={ColorModeIconTestId.lightIcon} />
  );
};

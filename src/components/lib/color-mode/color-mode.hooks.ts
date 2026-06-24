import { useTheme } from "next-themes";
import type { ColorMode, UseColorModeReturn } from "./color-mode.types";

export const useColorMode = (): UseColorModeReturn => {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const colorMode = forcedTheme || resolvedTheme;

  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode: () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    },
  };
};

export const useColorModeValue = <T>(light: T, dark: T): T => {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
};

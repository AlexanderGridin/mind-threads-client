import type { ThemeProviderProps } from "next-themes";

export type ColorModeProviderProps = ThemeProviderProps;
export type ColorMode = "light" | "dark";

export type UseColorModeReturn = {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
};

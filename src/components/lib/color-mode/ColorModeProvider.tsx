import { ThemeProvider } from "next-themes";
import type { ColorModeProviderProps } from "./color-mode.types";

export const ColorModeProvider = (props: ColorModeProviderProps) => (
  <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
);

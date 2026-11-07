import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { ChakraUIProvider } from "../ChakraUIProvider";

export const renderWithUIProvider = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return render(ui, {
    wrapper: ChakraUIProvider,
    ...options,
  });
};

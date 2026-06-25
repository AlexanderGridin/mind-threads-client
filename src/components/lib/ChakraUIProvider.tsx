import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { nordSystem } from "./theme";
import { ColorModeProvider } from "./color-mode/ColorModeProvider";

type ChakraUIProviderProps = {
  children: ReactNode;
};

export const ChakraUIProvider = ({ children }: ChakraUIProviderProps) => {
  return (
    <ChakraProvider value={nordSystem}>
      <ColorModeProvider>{children}</ColorModeProvider>
    </ChakraProvider>
  );
};

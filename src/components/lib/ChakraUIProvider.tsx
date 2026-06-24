import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { ColorModeProvider } from "./color-mode/ColorModeProvider";

type ChakraUIProviderProps = {
  children: ReactNode;
};

export const ChakraUIProvider = ({ children }: ChakraUIProviderProps) => {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>{children}</ColorModeProvider>
    </ChakraProvider>
  );
};

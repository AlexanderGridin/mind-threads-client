import {
  ChakraProvider as ChakraProviderComponent,
  defaultSystem,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type ChakraUIProviderProps = {
  children: ReactNode;
};

export const ChakraUIProvider = ({ children }: ChakraUIProviderProps) => {
  return (
    <ChakraProviderComponent value={defaultSystem}>
      {children}
    </ChakraProviderComponent>
  );
};

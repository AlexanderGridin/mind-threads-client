import { VStack as ChakraVStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type VStackProps = {
  children: ReactNode;
  "data-testid"?: string;
  gap?: string;
  alignItems?: "flex-start" | "flex-end" | "center";
  p?: string;
};

export const VStack = ({ children, ...props }: VStackProps) => (
  <ChakraVStack {...props}>{children}</ChakraVStack>
);

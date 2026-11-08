import { VStack as ChakraVStack } from "@chakra-ui/react";
import type { ElementType, FormEvent, ReactNode } from "react";

export type VStackProps = {
  children: ReactNode;
  "data-testid"?: string;
  gap?: string;
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch";
  p?: string;
  pr?: string;
  as?: ElementType;
  id?: string;
  onSubmit?: (event: FormEvent) => void;
};

export const VStack = ({ children, ...props }: VStackProps) => (
  <ChakraVStack {...props}>{children}</ChakraVStack>
);

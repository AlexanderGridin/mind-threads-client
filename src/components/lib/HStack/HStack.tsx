import { HStack as ChakraHStack } from "@chakra-ui/react";
import type { ReactNode, ElementType } from "react";

export type HStackProps = {
  children: ReactNode;
  as?: ElementType;
  justifyContent?: "space-between" | "flex-start" | "flex-end" | "center";
  alignItems?: "center" | "flex-start" | "flex-end";
  gap?: string;
  px?: string;
  py?: string;
  borderBottomWidth?: string;
  borderColor?: string;
  backgroundColor?: string;
  "data-testid"?: string;
  fontSize?: string;
  color?: string;
  minWidth?: string;
};

export const HStack = ({ children, ...props }: HStackProps) => (
  <ChakraHStack {...props}>{children}</ChakraHStack>
);

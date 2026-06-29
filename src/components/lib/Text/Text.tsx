import { Text as ChakraText } from "@chakra-ui/react";
import type { ReactNode, ElementType } from "react";

export type TextProps = {
  children: ReactNode;
  as?: ElementType;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  "data-testid"?: string;
};

export const Text = ({ children, ...props }: TextProps) => (
  <ChakraText {...props}>{children}</ChakraText>
);

import { Box as ChakraBox } from "@chakra-ui/react";
import type { ReactNode, ElementType, MouseEvent } from "react";

export type BoxProps = {
  children?: ReactNode;
  as?: ElementType;
  "data-testid"?: string;
  px?: string;
  py?: string;
  p?: string;
  display?: string;
  flexDirection?: string;
  gridTemplateColumns?: string;
  gap?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  overflow?: string;
  _hover?: { borderColor?: string; boxShadow?: string };
  transition?: string;
  width?: string;
  height?: string;
  textAlign?: string;
  cursor?: string;
  position?: string;
  top?: string;
  right?: string;
  onClick?: (event: MouseEvent) => void;
  backgroundColor?: string;
  flexShrink?: number;
  flexGrow?: number;
};

export const Box = ({ children, ...props }: BoxProps) => (
  <ChakraBox {...props}>{children}</ChakraBox>
);

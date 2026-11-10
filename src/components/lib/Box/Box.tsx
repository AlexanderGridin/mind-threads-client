import { forwardRef } from "react";
import { Box as ChakraBox } from "@chakra-ui/react";
import type { ReactNode, ElementType, MouseEvent } from "react";

export type BoxProps = {
  children?: ReactNode;
  as?: ElementType;
  type?: "button";
  "aria-current"?: boolean;
  "data-testid"?: string;
  px?: string;
  py?: string;
  p?: string;
  pl?: string;
  pr?: string;
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
  zIndex?: string;
  alignItems?: string;
  justifyContent?: string;
  minWidth?: string;
  divideX?: string;
  divideColor?: string;
  borderBottomWidth?: string;
  minHeight?: string;
  overflowY?: string;
  gridTemplateRows?: string;
  borderLeftWidth?: string;
  borderLeftColor?: string;
};

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraBox ref={ref} {...props}>
        {children}
      </ChakraBox>
    );
  }
);

Box.displayName = "Box";

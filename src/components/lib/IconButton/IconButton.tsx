import { forwardRef } from "react";
import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type IconButtonProps = {
  children: ReactNode;
  "aria-label": string;
  onClick: () => void;
  "data-testid"?: string;
  variant?: "subtle" | "outline" | "solid" | "surface" | "ghost" | "plain";
  borderColor?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs";
  css?: { _icon?: { width?: string; height?: string } };
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, ...props }, ref) => (
    <ChakraIconButton ref={ref} {...props}>
      {children}
    </ChakraIconButton>
  )
);

IconButton.displayName = "IconButton";

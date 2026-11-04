import { LinkOverlay as ChakraLinkOverlay } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type LinkOverlayProps = {
  children: ReactNode;
  asChild?: boolean;
  "data-testid"?: string;
};

export const LinkOverlay = ({ children, ...props }: LinkOverlayProps) => {
  return (
    <ChakraLinkOverlay
      {...props}
      _focusVisible={{
        outline: "none",
        _before: {
          outline: "2px solid",
          outlineColor: "accent",
          outlineOffset: "-2px",
          borderRadius: "md",
        },
      }}
    >
      {children}
    </ChakraLinkOverlay>
  );
};

import { forwardRef } from "react";
import { Span } from "@chakra-ui/react";
import type { SpanProps } from "@chakra-ui/react";

export const DarkMode = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => (
  <Span
    color="fg"
    display="contents"
    className="chakra-theme dark"
    colorPalette="gray"
    colorScheme="dark"
    ref={ref}
    {...props}
  />
));

DarkMode.displayName = "DarkMode";

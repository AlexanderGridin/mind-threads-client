import { forwardRef } from "react";
import { Span } from "@chakra-ui/react";
import type { SpanProps } from "@chakra-ui/react";

export const LightMode = forwardRef<HTMLSpanElement, SpanProps>(
  (props, ref) => (
    <Span
      color="fg"
      display="contents"
      className="chakra-theme light"
      colorPalette="gray"
      colorScheme="light"
      ref={ref}
      {...props}
    />
  )
);

LightMode.displayName = "LightMode";

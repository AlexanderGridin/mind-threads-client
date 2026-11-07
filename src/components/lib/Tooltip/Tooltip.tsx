import { Portal, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import type { ReactElement } from "react";

export type TooltipProps = {
  label: string;
  children: ReactElement;
  disabled?: boolean;
  contentTestId?: string;
};

export const Tooltip = ({
  label,
  children,
  disabled = false,
  contentTestId,
}: TooltipProps) => {
  return (
    <ChakraTooltip.Root disabled={disabled}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>

      <Portal>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content data-testid={contentTestId}>
            {label}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
};

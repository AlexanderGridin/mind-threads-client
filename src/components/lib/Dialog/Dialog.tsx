import { CloseButton, Dialog as ChakraDialog, Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type DialogProps = {
  open: boolean;
  title: string;
  content: ReactNode;
  actions: ReactNode;
  onClose: () => void;
};

export const Dialog = ({
  open,
  title,
  content,
  actions,
  onClose,
}: DialogProps) => {
  return (
    <ChakraDialog.Root
      lazyMount
      placement="center"
      open={open}
      onOpenChange={onClose}
    >
      <Portal>
        <ChakraDialog.Backdrop />

        <ChakraDialog.Positioner>
          <ChakraDialog.Content>
            <ChakraDialog.Header>
              <ChakraDialog.Title>{title}</ChakraDialog.Title>
            </ChakraDialog.Header>

            <ChakraDialog.Body>{content}</ChakraDialog.Body>

            <ChakraDialog.Footer>{actions}</ChakraDialog.Footer>

            <ChakraDialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </ChakraDialog.CloseTrigger>
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
};

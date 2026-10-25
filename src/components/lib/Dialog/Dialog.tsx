import { CloseButton, Dialog as ChakraDialog, Portal } from "@chakra-ui/react";
import type { ReactNode, RefObject } from "react";

export type DialogProps = {
  open: boolean;
  title: string;
  content: ReactNode;
  actions: ReactNode;
  closeDisabled?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export const Dialog = ({
  open,
  title,
  content,
  actions,
  closeDisabled = false,
  initialFocusRef,
  onClose,
}: DialogProps) => {
  const getInitialFocusRef = () => {
    return initialFocusRef?.current ?? null;
  };

  return (
    <ChakraDialog.Root
      lazyMount
      placement="center"
      open={open}
      closeOnEscape={!closeDisabled}
      closeOnInteractOutside={!closeDisabled}
      initialFocusEl={getInitialFocusRef}
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
              <CloseButton size="sm" disabled={closeDisabled} />
            </ChakraDialog.CloseTrigger>
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
};

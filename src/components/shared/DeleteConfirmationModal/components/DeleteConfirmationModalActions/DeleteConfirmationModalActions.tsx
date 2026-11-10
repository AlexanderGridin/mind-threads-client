import type { RefObject } from "react";
import { HStack, Button } from "@/components/lib";
import { DeleteConfirmationModalActionsTestId } from "./DeleteConfirmationModalActions.constants";

type DeleteConfirmationModalActionsProps = {
  isDeleting: boolean;
  cancelButtonRef: RefObject<HTMLButtonElement | null>;
  onDelete: () => void;
  onCancel: () => void;
};

export const DeleteConfirmationModalActions = ({
  isDeleting,
  cancelButtonRef,
  onDelete,
  onCancel,
}: DeleteConfirmationModalActionsProps) => {
  return (
    <HStack
      gap="2"
      data-testid={DeleteConfirmationModalActionsTestId.container}
    >
      <Button
        ref={cancelButtonRef}
        data-testid={DeleteConfirmationModalActionsTestId.cancelButton}
        variant="outline"
        disabled={isDeleting}
        onClick={onCancel}
      >
        Cancel
      </Button>

      <Button
        data-testid={DeleteConfirmationModalActionsTestId.deleteButton}
        background="red"
        loading={isDeleting}
        disabled={isDeleting}
        onClick={onDelete}
      >
        Delete
      </Button>
    </HStack>
  );
};

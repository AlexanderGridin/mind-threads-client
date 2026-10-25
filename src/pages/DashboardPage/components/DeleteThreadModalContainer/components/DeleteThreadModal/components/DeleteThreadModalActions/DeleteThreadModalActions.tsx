import { HStack, Button } from "@/components/lib";
import { DeleteThreadModalActionsTestId } from "./DeleteThreadModalActions.constants";
import type { DeleteThreadModalActionsProps } from "./DeleteThreadModalActions.types";

export const DeleteThreadModalActions = ({
  isDeleting,
  cancelButtonRef,
  onDelete,
  onCancel,
}: DeleteThreadModalActionsProps) => {
  return (
    <HStack gap="2" data-testid={DeleteThreadModalActionsTestId.container}>
      <Button
        ref={cancelButtonRef}
        data-testid={DeleteThreadModalActionsTestId.cancelButton}
        variant="outline"
        disabled={isDeleting}
        onClick={onCancel}
      >
        Cancel
      </Button>

      <Button
        data-testid={DeleteThreadModalActionsTestId.deleteButton}
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

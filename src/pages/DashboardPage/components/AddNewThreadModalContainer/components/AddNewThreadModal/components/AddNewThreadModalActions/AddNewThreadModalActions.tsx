import { HStack, Button } from "@/components/lib";
import { AddNewThreadModalActionsTestId } from "./AddNewThreadModalActions.constants";

export type AddNewThreadModalActionsProps = {
  submitDisabled: boolean;
  onAdd: () => void;
  onCancel: () => void;
};

export const AddNewThreadModalActions = ({
  submitDisabled,
  onAdd,
  onCancel,
}: AddNewThreadModalActionsProps) => {
  return (
    <HStack gap="2" data-testid={AddNewThreadModalActionsTestId.container}>
      <Button
        data-testid={AddNewThreadModalActionsTestId.cancelButton}
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>

      <Button
        data-testid={AddNewThreadModalActionsTestId.addButton}
        background="accent"
        disabled={submitDisabled}
        onClick={onAdd}
      >
        Add
      </Button>
    </HStack>
  );
};

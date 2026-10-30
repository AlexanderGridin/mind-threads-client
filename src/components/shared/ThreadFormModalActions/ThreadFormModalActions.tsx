import { HStack, Button } from "@/components/lib";
import {
  ThreadFormModalActionsTestId,
  CANCEL_BUTTON_LABEL,
} from "./ThreadFormModalActions.constants";
import type { ThreadFormModalActionsProps } from "./ThreadFormModalActions.types";

export const ThreadFormModalActions = ({
  submitLabel,
  submitDisabled,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ThreadFormModalActionsProps) => {
  return (
    <HStack gap="2" data-testid={ThreadFormModalActionsTestId.container}>
      <Button
        data-testid={ThreadFormModalActionsTestId.cancelButton}
        variant="outline"
        disabled={isSubmitting}
        onClick={onCancel}
      >
        {CANCEL_BUTTON_LABEL}
      </Button>

      <Button
        data-testid={ThreadFormModalActionsTestId.submitButton}
        background="accent"
        loading={isSubmitting}
        disabled={submitDisabled || isSubmitting}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
    </HStack>
  );
};

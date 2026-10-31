import { useState } from "react";
import { Dialog } from "@/components/lib";
import {
  ThreadForm,
  ThreadFormModalActions,
  type ThreadFormValue,
} from "@/components/shared";
import {
  EDIT_THREAD_MODAL_TITLE,
  SAVE_BUTTON_LABEL,
} from "./EditThreadModal.constants";
import type { EditThreadModalProps } from "./EditThreadModal.types";
import { canSaveThreadChanges } from "./EditThreadModal.utils";

export const EditThreadModal = ({
  thread,
  isSaving,
  onClose,
  onSave,
}: EditThreadModalProps) => {
  const [formValue, setFormValue] = useState<ThreadFormValue>({
    title: thread.title,
    color: thread.color,
  });

  const submitDisabled = !canSaveThreadChanges({ thread, formValue });

  const handleSave = () => {
    onSave(formValue);
  };

  return (
    <Dialog
      open
      title={EDIT_THREAD_MODAL_TITLE}
      closeDisabled={isSaving}
      onClose={onClose}
      content={
        <ThreadForm
          value={formValue}
          disabled={isSaving}
          onChange={setFormValue}
        />
      }
      actions={
        <ThreadFormModalActions
          submitLabel={SAVE_BUTTON_LABEL}
          submitDisabled={submitDisabled}
          isSubmitting={isSaving}
          onSubmit={handleSave}
          onCancel={onClose}
        />
      }
    />
  );
};

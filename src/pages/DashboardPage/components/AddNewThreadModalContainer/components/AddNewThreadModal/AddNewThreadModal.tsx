import { useState } from "react";
import { Dialog } from "@/components/lib";
import {
  ThreadForm,
  ThreadFormModalActions,
  type ThreadFormValue,
} from "@/components/shared";
import {
  ADD_BUTTON_LABEL,
  ADD_NEW_THREAD_MODAL_TITLE,
  DEFAULT_THREAD_FORM_VALUE,
} from "./AddNewThreadModal.constants";

export type AddNewThreadModalProps = {
  onClose: () => void;
  onSubmit: (value: ThreadFormValue) => void;
};

export const AddNewThreadModal = ({
  onClose,
  onSubmit,
}: AddNewThreadModalProps) => {
  const [formValue, setFormValue] = useState<ThreadFormValue>(
    DEFAULT_THREAD_FORM_VALUE
  );

  const submitDisabled = !formValue.title.trim();

  const handleAdd = () => {
    onSubmit(formValue);
  };

  return (
    <Dialog
      open
      title={ADD_NEW_THREAD_MODAL_TITLE}
      onClose={onClose}
      content={<ThreadForm value={formValue} onChange={setFormValue} />}
      actions={
        <ThreadFormModalActions
          submitLabel={ADD_BUTTON_LABEL}
          submitDisabled={submitDisabled}
          onSubmit={handleAdd}
          onCancel={onClose}
        />
      }
    />
  );
};

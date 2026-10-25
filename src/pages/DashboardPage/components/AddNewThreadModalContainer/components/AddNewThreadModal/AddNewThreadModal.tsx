import { useState } from "react";
import { Dialog } from "@/components/lib";
import { ThreadForm, AddNewThreadModalActions } from "./components";
import {
  ADD_NEW_THREAD_MODAL_TITLE,
  DEFAULT_THREAD_FORM_VALUE,
} from "./AddNewThreadModal.constants";
import type { ThreadFormValue } from "./AddNewThreadModal.types";

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
        <AddNewThreadModalActions
          onAdd={handleAdd}
          submitDisabled={!formValue.title.trim()}
          onCancel={onClose}
        />
      }
    />
  );
};

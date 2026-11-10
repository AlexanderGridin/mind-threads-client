import { useId, useRef, useState } from "react";
import { Dialog } from "@/components/lib";
import { ThreadFormModalActions } from "@/components/shared";
import type { SectionPageValue } from "@/types";
import { PageForm } from "./components";
import {
  ADD_PAGE_MODAL_TITLE,
  ADD_PAGE_SUBMIT_LABEL,
  DEFAULT_PAGE_FORM_VALUE,
} from "./AddPageModal.constants";

type AddPageModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (pageValue: SectionPageValue) => void;
};

export const AddPageModal = ({
  isSaving,
  onClose,
  onSubmit,
}: AddPageModalProps) => {
  const formId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formValue, setFormValue] = useState<SectionPageValue>(
    DEFAULT_PAGE_FORM_VALUE
  );

  const submitDisabled = !formValue.name.trim();

  const handleSubmit = () => {
    if (submitDisabled || isSaving) {
      return;
    }

    onSubmit(formValue);
  };

  return (
    <Dialog
      open
      title={ADD_PAGE_MODAL_TITLE}
      closeDisabled={isSaving}
      initialFocusRef={nameInputRef}
      onClose={onClose}
      content={
        <PageForm
          formId={formId}
          value={formValue}
          nameInputRef={nameInputRef}
          disabled={isSaving}
          onChange={setFormValue}
          onSubmit={handleSubmit}
        />
      }
      actions={
        <ThreadFormModalActions
          formId={formId}
          submitLabel={ADD_PAGE_SUBMIT_LABEL}
          submitDisabled={submitDisabled}
          isSubmitting={isSaving}
          onCancel={onClose}
        />
      }
    />
  );
};

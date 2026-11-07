import { useId, useRef, useState } from "react";
import { Dialog } from "@/components/lib";
import { ThreadFormModalActions } from "@/components/shared";
import type { ThreadSectionValue } from "@/types";
import { SectionForm } from "./components";
import {
  ADD_SECTION_MODAL_TITLE,
  ADD_SECTION_SUBMIT_LABEL,
  DEFAULT_SECTION_FORM_VALUE,
} from "./AddSectionModal.constants";

type AddSectionModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (sectionValue: ThreadSectionValue) => void;
};

export const AddSectionModal = ({
  isSaving,
  onClose,
  onSubmit,
}: AddSectionModalProps) => {
  const formId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formValue, setFormValue] = useState<ThreadSectionValue>(
    DEFAULT_SECTION_FORM_VALUE
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
      title={ADD_SECTION_MODAL_TITLE}
      closeDisabled={isSaving}
      initialFocusRef={nameInputRef}
      onClose={onClose}
      content={
        <SectionForm
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
          submitLabel={ADD_SECTION_SUBMIT_LABEL}
          submitDisabled={submitDisabled}
          isSubmitting={isSaving}
          onCancel={onClose}
        />
      }
    />
  );
};

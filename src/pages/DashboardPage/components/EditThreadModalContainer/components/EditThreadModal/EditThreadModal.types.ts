import type { ThreadFormValue } from "@/components/shared";
import type { MindThread } from "@/types";

export type EditThreadModalProps = {
  thread: MindThread;
  isSaving: boolean;
  onClose: () => void;
  onSave: (value: ThreadFormValue) => void;
};

export type CanSaveThreadChangesParams = {
  thread: MindThread;
  formValue: ThreadFormValue;
};

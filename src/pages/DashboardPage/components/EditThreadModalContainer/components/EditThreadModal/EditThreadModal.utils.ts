import type { CanSaveThreadChangesParams } from "./EditThreadModal.types";

export const canSaveThreadChanges = ({
  thread,
  formValue,
}: CanSaveThreadChangesParams) => {
  const trimmedTitle = formValue.title.trim();

  if (!trimmedTitle) {
    return false;
  }

  const titleChanged = trimmedTitle !== thread.title;

  const colorChanged =
    formValue.color.toLowerCase() !== thread.color.toLowerCase();

  return titleChanged || colorChanged;
};

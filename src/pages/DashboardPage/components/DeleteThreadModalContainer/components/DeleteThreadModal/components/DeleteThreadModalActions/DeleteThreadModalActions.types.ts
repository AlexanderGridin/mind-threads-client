import type { RefObject } from "react";

export type DeleteThreadModalActionsProps = {
  isDeleting: boolean;
  cancelButtonRef: RefObject<HTMLButtonElement | null>;
  onDelete: () => void;
  onCancel: () => void;
};

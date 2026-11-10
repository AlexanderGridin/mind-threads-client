import { DeleteConfirmationModal } from "@/components/shared";
import { DELETE_THREAD_MODAL_TITLE } from "./DeleteThreadModal.constants";
import { getDeleteThreadModalText } from "./DeleteThreadModal.utils";
import type { DeleteThreadModalProps } from "./DeleteThreadModal.types";

export const DeleteThreadModal = ({
  threadTitle,
  isDeleting,
  onClose,
  onDelete,
}: DeleteThreadModalProps) => {
  return (
    <DeleteConfirmationModal
      title={DELETE_THREAD_MODAL_TITLE}
      message={getDeleteThreadModalText(threadTitle)}
      isDeleting={isDeleting}
      onClose={onClose}
      onDelete={onDelete}
    />
  );
};

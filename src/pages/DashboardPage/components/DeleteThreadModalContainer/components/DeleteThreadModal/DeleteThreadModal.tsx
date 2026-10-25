import { useRef } from "react";
import { Dialog, Text } from "@/components/lib";
import { DeleteThreadModalActions } from "./components";
import { DELETE_THREAD_MODAL_TITLE } from "./DeleteThreadModal.constants";
import { getDeleteThreadModalText } from "./DeleteThreadModal.utils";
import type { DeleteThreadModalProps } from "./DeleteThreadModal.types";

export const DeleteThreadModal = ({
  threadTitle,
  isDeleting,
  onClose,
  onDelete,
}: DeleteThreadModalProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open
      title={DELETE_THREAD_MODAL_TITLE}
      closeDisabled={isDeleting}
      initialFocusRef={cancelButtonRef}
      onClose={onClose}
      content={<Text>{getDeleteThreadModalText(threadTitle)}</Text>}
      actions={
        <DeleteThreadModalActions
          isDeleting={isDeleting}
          cancelButtonRef={cancelButtonRef}
          onDelete={onDelete}
          onCancel={onClose}
        />
      }
    />
  );
};

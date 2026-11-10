import { useRef } from "react";
import { Dialog, Text } from "@/components/lib";
import { DeleteConfirmationModalActions } from "./components";

type DeleteConfirmationModalProps = {
  title: string;
  message: string;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export const DeleteConfirmationModal = ({
  title,
  message,
  isDeleting,
  onClose,
  onDelete,
}: DeleteConfirmationModalProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open
      title={title}
      closeDisabled={isDeleting}
      initialFocusRef={cancelButtonRef}
      onClose={onClose}
      content={<Text>{message}</Text>}
      actions={
        <DeleteConfirmationModalActions
          isDeleting={isDeleting}
          cancelButtonRef={cancelButtonRef}
          onDelete={onDelete}
          onCancel={onClose}
        />
      }
    />
  );
};

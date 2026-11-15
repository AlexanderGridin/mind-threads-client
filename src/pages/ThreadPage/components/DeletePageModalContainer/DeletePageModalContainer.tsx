import { DeleteConfirmationModal } from "@/components/shared";
import { useThreadPageAction, useThreadPageValue } from "../ThreadPageLoader";
import { DELETE_PAGE_MODAL_TITLE } from "./DeletePageModalContainer.constants";
import { getDeletePageModalText } from "./DeletePageModalContainer.utils";

export const DeletePageModalContainer = () => {
  const { pageToDelete, isDeletingPage } = useThreadPageValue();
  const { closeDeletePageModal, confirmDeletePage } = useThreadPageAction();

  return pageToDelete ? (
    <DeleteConfirmationModal
      title={DELETE_PAGE_MODAL_TITLE}
      message={getDeletePageModalText(pageToDelete.name)}
      isDeleting={isDeletingPage}
      onClose={closeDeletePageModal}
      onDelete={confirmDeletePage}
    />
  ) : null;
};

import { DeleteConfirmationModal } from "@/components/shared";
import { useThreadPageAction, useThreadPageValue } from "../ThreadPageLoader";
import { DELETE_SECTION_MODAL_TITLE } from "./DeleteSectionModalContainer.constants";
import { getDeleteSectionModalText } from "./DeleteSectionModalContainer.utils";

export const DeleteSectionModalContainer = () => {
  const { sectionToDelete, isDeletingSection } = useThreadPageValue();
  const { closeDeleteSectionModal, confirmDeleteSection } =
    useThreadPageAction();

  return sectionToDelete ? (
    <DeleteConfirmationModal
      title={DELETE_SECTION_MODAL_TITLE}
      message={getDeleteSectionModalText(sectionToDelete.name)}
      isDeleting={isDeletingSection}
      onClose={closeDeleteSectionModal}
      onDelete={confirmDeleteSection}
    />
  ) : null;
};

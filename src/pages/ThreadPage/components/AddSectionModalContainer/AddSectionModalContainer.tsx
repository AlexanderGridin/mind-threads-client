import { useThreadPageAction, useThreadPageValue } from "../ThreadPageLoader";
import { AddSectionModal } from "./components";

export const AddSectionModalContainer = () => {
  const { isAddSectionModalOpen, isSavingSection } = useThreadPageValue();
  const { closeAddSectionModal, submitNewSection } = useThreadPageAction();

  return isAddSectionModalOpen ? (
    <AddSectionModal
      isSaving={isSavingSection}
      onClose={closeAddSectionModal}
      onSubmit={submitNewSection}
    />
  ) : null;
};

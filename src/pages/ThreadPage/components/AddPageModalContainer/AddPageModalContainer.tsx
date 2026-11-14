import { useThreadPageAction, useThreadPageValue } from "../ThreadPageLoader";
import { AddPageModal } from "./components";

export const AddPageModalContainer = () => {
  const { isAddPageModalOpen, isSavingPage } = useThreadPageValue();
  const { closeAddPageModal, submitNewPage } = useThreadPageAction();

  return isAddPageModalOpen ? (
    <AddPageModal
      isSaving={isSavingPage}
      onClose={closeAddPageModal}
      onSubmit={submitNewPage}
    />
  ) : null;
};

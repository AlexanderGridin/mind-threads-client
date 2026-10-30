import {
  useDashboardPageValue,
  useDashboardPageAction,
} from "../DashboardPageLoader";
import { EditThreadModal } from "./components";

export const EditThreadModalContainer = () => {
  const { threadToEdit, isSavingThread } = useDashboardPageValue();
  const { closeEditThreadModal, submitEditedThread } = useDashboardPageAction();

  return threadToEdit ? (
    <EditThreadModal
      thread={threadToEdit}
      isSaving={isSavingThread}
      onClose={closeEditThreadModal}
      onSave={submitEditedThread}
    />
  ) : null;
};

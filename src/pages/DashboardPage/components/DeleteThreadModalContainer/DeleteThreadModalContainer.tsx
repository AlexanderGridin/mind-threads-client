import {
  useDashboardPageValue,
  useDashboardPageAction,
} from "../DashboardPageLoader";
import { DeleteThreadModal } from "./components";

export const DeleteThreadModalContainer = () => {
  const { threadToDelete, isDeletingThread } = useDashboardPageValue();
  const { closeDeleteThreadModal, confirmDeleteThread } =
    useDashboardPageAction();

  return threadToDelete ? (
    <DeleteThreadModal
      threadTitle={threadToDelete.title}
      isDeleting={isDeletingThread}
      onClose={closeDeleteThreadModal}
      onDelete={confirmDeleteThread}
    />
  ) : null;
};

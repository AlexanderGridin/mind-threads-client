import {
  useDashboardPageValue,
  useDashboardPageAction,
} from "../DashboardPageLoader";
import { AddNewThreadModal } from "./components";

export const AddNewThreadModalContainer = () => {
  const { isAddThreadModalOpen } = useDashboardPageValue();
  const { closeAddThreadModal, submitNewThread } = useDashboardPageAction();

  return isAddThreadModalOpen ? (
    <AddNewThreadModal
      onClose={closeAddThreadModal}
      onSubmit={submitNewThread}
    />
  ) : null;
};

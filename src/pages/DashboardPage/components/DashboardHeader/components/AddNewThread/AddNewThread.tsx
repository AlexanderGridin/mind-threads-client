import { Button } from "@/components/lib";
import { ThreadsStatus } from "@/pages/DashboardPage/DashboardPage.constants";
import {
  useDashboardPageAction,
  useDashboardPageValue,
} from "../../../DashboardPageLoader";
import {
  ADD_NEW_THREAD_BUTTON_LABEL,
  AddNewThreadTestId,
} from "./AddNewThread.constants";

export const AddNewThread = () => {
  const { threadsStatus } = useDashboardPageValue();
  const { openAddThreadModal } = useDashboardPageAction();

  return (
    <Button
      data-testid={AddNewThreadTestId.openModalButton}
      background="accent"
      disabled={threadsStatus !== ThreadsStatus.Loaded}
      onClick={openAddThreadModal}
    >
      {ADD_NEW_THREAD_BUTTON_LABEL}
    </Button>
  );
};

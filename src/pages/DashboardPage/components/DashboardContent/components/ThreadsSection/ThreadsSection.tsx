import { ThreadsStatus } from "@/pages/DashboardPage/DashboardPage.constants";
import { useDashboardPageValue } from "../../../DashboardPageLoader";
import { EmptyThreadList } from "../EmptyThreadList";
import { MindThreadList } from "../MindThreadList";
import { ThreadsLoadError } from "../ThreadsLoadError";

export const ThreadsSection = () => {
  const { threads, threadsStatus } = useDashboardPageValue();

  if (threadsStatus === ThreadsStatus.Loading) {
    return null;
  }

  if (threadsStatus === ThreadsStatus.Error) {
    return <ThreadsLoadError />;
  }

  return threads.length === 0 ? <EmptyThreadList /> : <MindThreadList />;
};

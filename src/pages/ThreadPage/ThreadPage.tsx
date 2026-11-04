import { useParams } from "react-router";
import { Box, FullScreenLoader } from "@/components/lib";
import { useDocumentTitle } from "@/hooks";
import { ThreadContent, ThreadHeader } from "./components";
import {
  LOADING_THREAD_LABEL,
  THREAD_PAGE_MIN_WIDTH,
  ThreadPageTestId,
  ThreadStatus,
} from "./ThreadPage.constants";
import { useThreadState } from "./ThreadPage.hooks";
import { getThreadPageTitle } from "./ThreadPage.utils";

export const ThreadPage = () => {
  const { threadId = "" } = useParams();
  const { thread, threadStatus } = useThreadState(threadId);

  useDocumentTitle(getThreadPageTitle({ thread, threadStatus }));

  return (
    <Box
      data-testid={ThreadPageTestId.container}
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minWidth={THREAD_PAGE_MIN_WIDTH}
    >
      <ThreadHeader thread={thread} />
      <ThreadContent threadStatus={threadStatus} />

      <FullScreenLoader
        shown={threadStatus === ThreadStatus.Loading}
        label={LOADING_THREAD_LABEL}
      />
    </Box>
  );
};

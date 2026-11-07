import { Box, FullScreenLoader } from "@/components/lib";
import { useDocumentTitle } from "@/hooks";
import {
  LOADING_THREAD_LABEL,
  THREAD_PAGE_MIN_WIDTH,
  ThreadPageTestId,
  ThreadStatus,
} from "@/pages/ThreadPage/ThreadPage.constants";
import { getThreadPageTitle } from "@/pages/ThreadPage/ThreadPage.utils";
import { ThreadContent } from "../ThreadContent";
import { ThreadHeader } from "../ThreadHeader";
import { useThreadPageValue } from "../ThreadPageLoader";

export const ThreadPageLayout = () => {
  const { thread, threadStatus } = useThreadPageValue();

  useDocumentTitle(getThreadPageTitle({ thread, threadStatus }));

  return (
    <Box
      data-testid={ThreadPageTestId.container}
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minWidth={THREAD_PAGE_MIN_WIDTH}
      minHeight="0"
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

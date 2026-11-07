import { Box } from "@/components/lib";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import { ThreadView } from "./components";
import { ThreadContentTestId } from "./ThreadContent.constants";

type ThreadContentProps = {
  threadStatus: ThreadStatusType;
};

export const ThreadContent = ({ threadStatus }: ThreadContentProps) => {
  return (
    <Box
      data-testid={ThreadContentTestId.container}
      as="main"
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minHeight="0"
      backgroundColor="bg"
    >
      <ThreadView threadStatus={threadStatus} />
    </Box>
  );
};

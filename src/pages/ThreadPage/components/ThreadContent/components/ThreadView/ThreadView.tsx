import {
  ThreadStatus,
  THREAD_LOAD_ERROR_MESSAGE,
  THREAD_NOT_FOUND_MESSAGE,
} from "@/pages/ThreadPage/ThreadPage.constants";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import { ThreadColumns } from "../ThreadColumns";
import { ThreadMessage } from "../ThreadMessage";

type ThreadViewProps = {
  threadStatus: ThreadStatusType;
};

export const ThreadView = ({ threadStatus }: ThreadViewProps) => {
  if (threadStatus === ThreadStatus.Loading) {
    return null;
  }

  if (threadStatus === ThreadStatus.NotFound) {
    return <ThreadMessage message={THREAD_NOT_FOUND_MESSAGE} />;
  }

  if (threadStatus === ThreadStatus.Error) {
    return <ThreadMessage message={THREAD_LOAD_ERROR_MESSAGE} />;
  }

  return <ThreadColumns />;
};

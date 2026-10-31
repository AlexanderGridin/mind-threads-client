import { APP_NAME } from "@/components/shared";
import { ThreadStatus } from "./ThreadPage.constants";
import type { GetThreadPageTitleParams } from "./ThreadPage.types";

const getPageTitle = (pageName: string) => {
  return `${pageName} · ${APP_NAME}`;
};

export const getThreadPageTitle = ({
  thread,
  threadStatus,
}: GetThreadPageTitleParams) => {
  if (thread) {
    return getPageTitle(thread.title);
  }

  if (threadStatus === ThreadStatus.NotFound) {
    return getPageTitle("Thread not found");
  }

  return APP_NAME;
};

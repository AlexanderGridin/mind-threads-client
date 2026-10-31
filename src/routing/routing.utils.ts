import { generatePath } from "react-router";
import { AppPath } from "./routing.constants";

export const getThreadPath = (threadId: string) => {
  return generatePath(AppPath.Thread, { threadId });
};

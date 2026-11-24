import type { MessagesStatus } from "./ChatPageView.constants";

export type MessagesStatusType =
  (typeof MessagesStatus)[keyof typeof MessagesStatus];

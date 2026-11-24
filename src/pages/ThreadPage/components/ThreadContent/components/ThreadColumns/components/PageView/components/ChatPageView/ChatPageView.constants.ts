import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ChatPageView__");

export const ChatPageViewTestId = {
  container: createTestId("container"),
} as const;

export const MessagesStatus = {
  Loading: "loading",
  Loaded: "loaded",
  Error: "error",
} as const;

export const SEND_MESSAGE_ERROR_MESSAGE =
  "Message could not be sent. Please try again.";

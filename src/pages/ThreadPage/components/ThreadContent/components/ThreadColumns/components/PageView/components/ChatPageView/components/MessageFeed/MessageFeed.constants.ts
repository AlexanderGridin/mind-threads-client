import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MessageFeed__");

export const MessageFeedTestId = {
  container: createTestId("container"),
} as const;

export const EMPTY_FEED_MESSAGE =
  "No messages yet. Write your first message above.";
export const LOADING_MESSAGES_LABEL = "Loading messages";

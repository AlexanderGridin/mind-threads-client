import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MessageList__");

export const MessageListTestId = {
  container: createTestId("container"),
  row: createTestId("row"),
} as const;

export const MESSAGE_ESTIMATED_HEIGHT = 96;
export const MESSAGE_LIST_OVERSCAN = 5;

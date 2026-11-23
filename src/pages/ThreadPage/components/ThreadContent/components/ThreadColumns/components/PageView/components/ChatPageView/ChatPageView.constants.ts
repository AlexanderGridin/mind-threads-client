import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ChatPageView__");

export const ChatPageViewTestId = {
  container: createTestId("container"),
} as const;

export const COMPOSER_MESSAGE_LOG_LABEL = "Composer message:";

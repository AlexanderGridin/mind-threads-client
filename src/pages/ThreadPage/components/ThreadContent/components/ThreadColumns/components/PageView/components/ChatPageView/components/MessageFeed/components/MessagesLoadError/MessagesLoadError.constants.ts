import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MessagesLoadError__");

export const MessagesLoadErrorTestId = {
  container: createTestId("container"),
  message: createTestId("message"),
} as const;

export const MESSAGES_LOAD_ERROR_MESSAGE = "Couldn't load the messages.";
export const TRY_AGAIN_LABEL = "Try again";

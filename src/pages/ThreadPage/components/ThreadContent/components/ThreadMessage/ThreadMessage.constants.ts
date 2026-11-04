import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadMessage__");

export const ThreadMessageTestId = {
  container: createTestId("container"),
  message: createTestId("message"),
  backButton: createTestId("back-button"),
} as const;

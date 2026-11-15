import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ComposerFooter__");

export const ComposerFooterTestId = {
  sendButton: createTestId("send-button"),
  hint: createTestId("hint"),
} as const;

export const SEND_HINT = "Ctrl + Enter to send";

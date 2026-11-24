import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MessageItem__");

export const MessageItemTestId = {
  container: createTestId("container"),
  sentAt: createTestId("sent-at"),
  tags: createTestId("tags"),
} as const;

export const MESSAGE_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

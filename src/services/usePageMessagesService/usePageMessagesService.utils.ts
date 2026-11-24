import type { ChatMessage, NewChatMessage } from "@/types";

export const buildMessage = ({
  threadId,
  sectionId,
  pageId,
  content,
  tags,
}: NewChatMessage): ChatMessage => {
  return {
    id: crypto.randomUUID(),
    threadId,
    sectionId,
    pageId,
    content,
    tags: [...tags],
    createdAt: new Date().toISOString(),
  };
};

const isStringList = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      return typeof item === "string";
    })
  );
};

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Partial<Record<keyof ChatMessage, unknown>>;

  return (
    typeof message.id === "string" &&
    typeof message.threadId === "string" &&
    typeof message.sectionId === "string" &&
    typeof message.pageId === "string" &&
    typeof message.content === "string" &&
    isStringList(message.tags) &&
    typeof message.createdAt === "string" &&
    !Number.isNaN(Date.parse(message.createdAt))
  );
};

export const isChatMessageList = (value: unknown): value is ChatMessage[] => {
  return Array.isArray(value) && value.every(isChatMessage);
};

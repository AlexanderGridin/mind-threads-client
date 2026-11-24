import { MESSAGES_STORAGE_KEY } from "@/services/usePageMessagesService/usePageMessagesService.constants";
import type { ChatMessage } from "@/types";

export const seedMessages = (messages: ChatMessage[]) => {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
};

export const readStoredMessages = (): ChatMessage[] => {
  return JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) ?? "[]");
};

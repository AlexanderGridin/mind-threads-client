import type { ChatMessage, NewChatMessage } from "@/types";

export type UsePageMessagesServiceReturn = {
  getPageMessages: (pageId: string) => Promise<ChatMessage[]>;
  createMessage: (newMessage: NewChatMessage) => Promise<ChatMessage>;
  deletePageMessages: (pageId: string) => Promise<void>;
  deleteSectionMessages: (sectionId: string) => Promise<void>;
  deleteThreadMessages: (threadId: string) => Promise<void>;
};

export type ChatMessagePredicate = (message: ChatMessage) => boolean;

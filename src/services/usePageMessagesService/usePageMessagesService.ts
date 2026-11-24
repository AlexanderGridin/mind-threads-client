import { useLocalStorage } from "@/hooks";
import type { ChatMessage, NewChatMessage } from "@/types";
import {
  INVALID_MESSAGES_DATA_ERROR,
  MESSAGES_STORAGE_KEY,
} from "./usePageMessagesService.constants";
import type {
  ChatMessagePredicate,
  UsePageMessagesServiceReturn,
} from "./usePageMessagesService.types";
import {
  buildMessage,
  isChatMessageList,
} from "./usePageMessagesService.utils";

export const usePageMessagesService = (): UsePageMessagesServiceReturn => {
  const messagesStorage = useLocalStorage<ChatMessage[]>({
    key: MESSAGES_STORAGE_KEY,
    throwOnError: true,
  });

  const getMessages = async (): Promise<ChatMessage[]> => {
    const storedMessages = messagesStorage.read();

    if (!storedMessages) {
      return [];
    }

    if (!isChatMessageList(storedMessages)) {
      throw new Error(INVALID_MESSAGES_DATA_ERROR);
    }

    return storedMessages;
  };

  const getPageMessages = async (pageId: string): Promise<ChatMessage[]> => {
    const storedMessages = await getMessages();

    return storedMessages.filter((message) => {
      return message.pageId === pageId;
    });
  };

  const createMessage = async (
    newMessage: NewChatMessage
  ): Promise<ChatMessage> => {
    const createdMessage = buildMessage(newMessage);
    const storedMessages = await getMessages();

    messagesStorage.set([createdMessage, ...storedMessages]);

    return createdMessage;
  };

  const deleteMatchingMessages = async (
    isMatching: ChatMessagePredicate
  ): Promise<void> => {
    const storedMessages = await getMessages();

    const remainingMessages = storedMessages.filter((message) => {
      return !isMatching(message);
    });

    if (remainingMessages.length !== storedMessages.length) {
      messagesStorage.set(remainingMessages);
    }
  };

  const deletePageMessages = async (pageId: string): Promise<void> => {
    await deleteMatchingMessages((message) => {
      return message.pageId === pageId;
    });
  };

  const deleteSectionMessages = async (sectionId: string): Promise<void> => {
    await deleteMatchingMessages((message) => {
      return message.sectionId === sectionId;
    });
  };

  const deleteThreadMessages = async (threadId: string): Promise<void> => {
    await deleteMatchingMessages((message) => {
      return message.threadId === threadId;
    });
  };

  return {
    getPageMessages,
    createMessage,
    deletePageMessages,
    deleteSectionMessages,
    deleteThreadMessages,
  };
};

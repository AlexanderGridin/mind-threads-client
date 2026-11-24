import { useEffect, useState } from "react";
import { notify } from "@/components/lib";
import { useThreadPageAction } from "@/pages/ThreadPage/components/ThreadPageLoader";
import type { ChatMessage, SectionPage } from "@/types";
import type { ComposerMessage } from "./components/MessageComposer/MessageComposer.types";
import {
  MessagesStatus,
  SEND_MESSAGE_ERROR_MESSAGE,
} from "./ChatPageView.constants";
import type { MessagesStatusType } from "./ChatPageView.types";

export const usePageMessages = (page: SectionPage) => {
  const { getPageMessages, addPageMessage } = useThreadPageAction();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [messagesStatus, setMessagesStatus] = useState<MessagesStatusType>(
    MessagesStatus.Loading
  );

  useEffect(() => {
    if (messagesStatus !== MessagesStatus.Loading) {
      return;
    }

    let isActive = true;

    const loadMessages = async () => {
      try {
        const storedMessages = await getPageMessages(page.id);

        if (!isActive) {
          return;
        }

        setMessages(storedMessages);
        setMessagesStatus(MessagesStatus.Loaded);
      } catch {
        if (isActive) {
          setMessagesStatus(MessagesStatus.Error);
        }
      }
    };

    loadMessages();

    return () => {
      isActive = false;
    };
  }, [page.id, messagesStatus, getPageMessages]);

  const retryLoadingMessages = () => {
    setMessagesStatus(MessagesStatus.Loading);
  };

  const sendMessage = async ({ content, tags }: ComposerMessage) => {
    try {
      const createdMessage = await addPageMessage({
        threadId: page.threadId,
        sectionId: page.sectionId,
        pageId: page.id,
        content,
        tags,
      });

      setMessages((currentMessages) => {
        return [createdMessage, ...currentMessages];
      });

      return true;
    } catch {
      notify.error(SEND_MESSAGE_ERROR_MESSAGE);

      return false;
    }
  };

  return { messages, messagesStatus, retryLoadingMessages, sendMessage };
};

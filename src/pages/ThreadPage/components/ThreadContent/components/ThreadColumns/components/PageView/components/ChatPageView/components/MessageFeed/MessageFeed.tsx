import { Box, FullScreenLoader } from "@/components/lib";
import { ThreadColumnMessage } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumnMessage";
import type { ChatMessage } from "@/types";
import { MessagesStatus } from "../../ChatPageView.constants";
import type { MessagesStatusType } from "../../ChatPageView.types";
import { MessageList, MessagesLoadError } from "./components";
import {
  EMPTY_FEED_MESSAGE,
  LOADING_MESSAGES_LABEL,
  MessageFeedTestId,
} from "./MessageFeed.constants";

type MessageFeedProps = {
  messages: ChatMessage[];
  messagesStatus: MessagesStatusType;
  onRetry: () => void;
};

export const MessageFeed = ({
  messages,
  messagesStatus,
  onRetry,
}: MessageFeedProps) => {
  const isLoaded = messagesStatus === MessagesStatus.Loaded;
  const isError = messagesStatus === MessagesStatus.Error;

  const shouldShowMessages = isLoaded && messages.length;
  const shouldShowEmptyListMessage = isLoaded && !messages.length;

  return (
    <Box
      data-testid={MessageFeedTestId.container}
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minHeight="0"
    >
      {isError ? <MessagesLoadError onRetry={onRetry} /> : null}
      {shouldShowMessages ? <MessageList messages={messages} /> : null}

      {shouldShowEmptyListMessage ? (
        <ThreadColumnMessage message={EMPTY_FEED_MESSAGE} />
      ) : null}

      <FullScreenLoader
        shown={messagesStatus === MessagesStatus.Loading}
        label={LOADING_MESSAGES_LABEL}
      />
    </Box>
  );
};

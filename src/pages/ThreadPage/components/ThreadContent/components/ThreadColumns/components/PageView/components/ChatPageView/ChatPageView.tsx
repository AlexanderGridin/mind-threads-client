import { Box } from "@/components/lib";
import type { SectionPage } from "@/types";
import { MessageComposer, MessageFeed } from "./components";
import { usePageMessages } from "./ChatPageView.hooks";
import { ChatPageViewTestId } from "./ChatPageView.constants";

type ChatPageViewProps = {
  page: SectionPage;
};

export const ChatPageView = ({ page }: ChatPageViewProps) => {
  const { messages, messagesStatus, retryLoadingMessages, sendMessage } =
    usePageMessages(page);

  return (
    <Box
      data-testid={ChatPageViewTestId.container}
      display="flex"
      flexDirection="column"
      gap="4"
      flexGrow={1}
      minHeight="0"
    >
      <MessageComposer onSend={sendMessage} />

      <MessageFeed
        messages={messages}
        messagesStatus={messagesStatus}
        onRetry={retryLoadingMessages}
      />
    </Box>
  );
};

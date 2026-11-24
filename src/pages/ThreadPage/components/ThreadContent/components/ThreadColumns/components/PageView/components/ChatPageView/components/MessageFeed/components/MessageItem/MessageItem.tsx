import { Box, Text } from "@/components/lib";
import type { ChatMessage } from "@/types";
import { TagChip } from "../../../TagChip";
import { MessageContent } from "../MessageContent";
import { MessageItemTestId } from "./MessageItem.constants";
import { formatMessageDate } from "./MessageItem.utils";

type MessageItemProps = {
  message: ChatMessage;
};

export const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <Box
      data-testid={MessageItemTestId.container}
      display="flex"
      flexDirection="column"
      gap="2"
      maxWidth="80%"
      minWidth="0"
      p="3"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border"
      backgroundColor="bg.muted"
    >
      <Text
        data-testid={MessageItemTestId.sentAt}
        fontSize="xs"
        color="fg.muted"
      >
        {formatMessageDate(message.createdAt)}
      </Text>

      {message.tags.length ? (
        <Box
          data-testid={MessageItemTestId.tags}
          display="flex"
          flexWrap="wrap"
          gap="1.5"
        >
          {message.tags.map((tag) => {
            return <TagChip key={tag} tag={tag} />;
          })}
        </Box>
      ) : null}

      <MessageContent content={message.content} />
    </Box>
  );
};

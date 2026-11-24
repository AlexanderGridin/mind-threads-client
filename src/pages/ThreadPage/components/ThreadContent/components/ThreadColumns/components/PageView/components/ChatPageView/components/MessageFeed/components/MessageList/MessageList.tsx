import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box } from "@/components/lib";
import type { ChatMessage } from "@/types";
import { MessageItem } from "../MessageItem";
import {
  MESSAGE_ESTIMATED_HEIGHT,
  MESSAGE_LIST_OVERSCAN,
  MessageListTestId,
} from "./MessageList.constants";

type MessageListProps = {
  messages: ChatMessage[];
};

export const MessageList = ({ messages }: MessageListProps) => {
  "use no memo"; // useVirtualizer returns a mutable instance the compiler cannot memoize.

  const scrollElementRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => {
      return scrollElementRef.current;
    },
    estimateSize: () => {
      return MESSAGE_ESTIMATED_HEIGHT;
    },
    getItemKey: (index) => {
      return messages[index].id;
    },
    overscan: MESSAGE_LIST_OVERSCAN,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const firstItemStart = virtualItems[0]?.start ?? 0;

  return (
    <Box
      ref={scrollElementRef}
      data-testid={MessageListTestId.container}
      flexGrow={1}
      minHeight="0"
      overflowY="auto"
      pr="4"
    >
      <Box
        position="relative"
        width="100%"
        height={`${virtualizer.getTotalSize()}px`}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          transform={`translateY(${firstItemStart}px)`}
        >
          {virtualItems.map((virtualItem) => {
            return (
              <Box
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                data-testid={MessageListTestId.row}
                display="flex"
                justifyContent="flex-end"
                pb="3"
              >
                <MessageItem message={messages[virtualItem.index]} />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

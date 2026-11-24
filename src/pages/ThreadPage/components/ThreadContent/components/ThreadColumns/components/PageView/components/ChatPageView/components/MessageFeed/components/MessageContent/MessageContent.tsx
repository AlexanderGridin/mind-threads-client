import { Box } from "@/components/lib";
import chatPageViewStyles from "../../../../ChatPageView.module.css";
import { MessageContentTestId } from "./MessageContent.constants";
import { sanitizeMessageContent } from "./MessageContent.utils";

type MessageContentProps = {
  content: string;
};

export const MessageContent = ({ content }: MessageContentProps) => {
  return (
    <Box
      data-testid={MessageContentTestId.container}
      className={chatPageViewStyles.richText}
      dangerouslySetInnerHTML={{ __html: sanitizeMessageContent(content) }}
    />
  );
};

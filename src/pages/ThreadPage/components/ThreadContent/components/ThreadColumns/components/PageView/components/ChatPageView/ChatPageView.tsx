import { Box } from "@/components/lib";
import { MessageComposer } from "./components/MessageComposer";
import { ChatPageViewTestId } from "./ChatPageView.constants";
import { logComposerMessage } from "./ChatPageView.utils";

export const ChatPageView = () => {
  return (
    <Box
      data-testid={ChatPageViewTestId.container}
      display="flex"
      flexDirection="column"
      gap="3"
    >
      <MessageComposer onSend={logComposerMessage} />
    </Box>
  );
};

import { Box, Button, Text } from "@/components/lib";
import {
  MESSAGES_LOAD_ERROR_MESSAGE,
  MessagesLoadErrorTestId,
  TRY_AGAIN_LABEL,
} from "./MessagesLoadError.constants";

type MessagesLoadErrorProps = {
  onRetry: () => void;
};

export const MessagesLoadError = ({ onRetry }: MessagesLoadErrorProps) => {
  return (
    <Box
      data-testid={MessagesLoadErrorTestId.container}
      p="4"
      borderRadius="md"
      borderWidth="1px"
      borderColor="red"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap="3"
    >
      <Text data-testid={MessagesLoadErrorTestId.message} color="fg">
        {MESSAGES_LOAD_ERROR_MESSAGE}
      </Text>

      <Button size="sm" variant="outline" onClick={onRetry}>
        {TRY_AGAIN_LABEL}
      </Button>
    </Box>
  );
};

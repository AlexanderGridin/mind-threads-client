import { Button, Text, VStack } from "@/components/lib";
import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
import { useNavigateToDashboard } from "@/pages/ThreadPage/ThreadPage.hooks";
import { ThreadMessageTestId } from "./ThreadMessage.constants";

type ThreadMessageProps = {
  message: string;
};

export const ThreadMessage = ({ message }: ThreadMessageProps) => {
  const navigateToDashboard = useNavigateToDashboard();

  return (
    <VStack
      data-testid={ThreadMessageTestId.container}
      gap="4"
      alignItems="center"
      p="10"
    >
      <Text
        data-testid={ThreadMessageTestId.message}
        fontSize="lg"
        color="fg.muted"
      >
        {message}
      </Text>

      <Button
        data-testid={ThreadMessageTestId.backButton}
        background="accent"
        onClick={navigateToDashboard}
      >
        {BACK_TO_DASHBOARD_LABEL}
      </Button>
    </VStack>
  );
};

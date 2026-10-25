import { Button, Text, VStack } from "@/components/lib";
import { useDashboardPageAction } from "../../../DashboardPageLoader";
import {
  EMPTY_THREAD_LIST_BUTTON_LABEL,
  EMPTY_THREAD_LIST_MESSAGE,
  EmptyThreadListTestId,
} from "./EmptyThreadList.constants";

export const EmptyThreadList = () => {
  const { openAddThreadModal } = useDashboardPageAction();

  return (
    <VStack
      data-testid={EmptyThreadListTestId.container}
      gap="4"
      alignItems="center"
      p="10"
    >
      <Text
        data-testid={EmptyThreadListTestId.message}
        fontSize="lg"
        color="fg.muted"
      >
        {EMPTY_THREAD_LIST_MESSAGE}
      </Text>

      <Button
        data-testid={EmptyThreadListTestId.addButton}
        background="accent"
        onClick={openAddThreadModal}
      >
        {EMPTY_THREAD_LIST_BUTTON_LABEL}
      </Button>
    </VStack>
  );
};

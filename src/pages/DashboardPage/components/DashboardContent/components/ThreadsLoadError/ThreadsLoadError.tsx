import { Box, Text } from "@/components/lib";
import {
  THREADS_LOAD_ERROR_MESSAGE,
  ThreadsLoadErrorTestId,
} from "./ThreadsLoadError.constants";

export const ThreadsLoadError = () => (
  <Box
    data-testid={ThreadsLoadErrorTestId.container}
    p="6"
    borderRadius="md"
    borderWidth="1px"
    borderColor="red"
    backgroundColor="bg"
  >
    <Text data-testid={ThreadsLoadErrorTestId.message} color="fg">
      {THREADS_LOAD_ERROR_MESSAGE}
    </Text>
  </Box>
);

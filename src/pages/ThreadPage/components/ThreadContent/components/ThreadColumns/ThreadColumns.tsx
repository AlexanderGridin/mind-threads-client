import { Box } from "@/components/lib";
import {
  SectionsColumn,
  ThreadColumn,
  ThreadColumnMessage,
} from "./components";
import {
  CONTENT_COLUMN_MESSAGE,
  PAGES_COLUMN_HEADING,
  PAGES_COLUMN_MESSAGE,
  THREAD_COLUMNS_ROWS_TEMPLATE,
  THREAD_COLUMNS_TEMPLATE,
  ThreadColumnsTestId,
} from "./ThreadColumns.constants";

export const ThreadColumns = () => {
  return (
    <Box
      data-testid={ThreadColumnsTestId.container}
      display="grid"
      gridTemplateColumns={THREAD_COLUMNS_TEMPLATE}
      gridTemplateRows={THREAD_COLUMNS_ROWS_TEMPLATE}
      flexGrow={1}
      minHeight="0"
      divideX="1px"
      divideColor="border"
    >
      <SectionsColumn />

      <ThreadColumn
        data-testid={ThreadColumnsTestId.pagesColumn}
        heading={PAGES_COLUMN_HEADING}
      >
        <ThreadColumnMessage message={PAGES_COLUMN_MESSAGE} />
      </ThreadColumn>

      <ThreadColumn data-testid={ThreadColumnsTestId.contentColumn} isCentered>
        <ThreadColumnMessage message={CONTENT_COLUMN_MESSAGE} />
      </ThreadColumn>
    </Box>
  );
};

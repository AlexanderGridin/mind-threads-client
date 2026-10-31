import { Box } from "@/components/lib";
import { ThreadColumn } from "./components";
import {
  CONTENT_COLUMN_MESSAGE,
  PAGES_COLUMN_HEADING,
  PAGES_COLUMN_MESSAGE,
  SECTIONS_COLUMN_HEADING,
  SECTIONS_COLUMN_MESSAGE,
  THREAD_COLUMNS_TEMPLATE,
  ThreadColumnsTestId,
} from "./ThreadColumns.constants";

export const ThreadColumns = () => {
  return (
    <Box
      data-testid={ThreadColumnsTestId.container}
      display="grid"
      gridTemplateColumns={THREAD_COLUMNS_TEMPLATE}
      flexGrow={1}
      divideX="1px"
      divideColor="border"
    >
      <ThreadColumn
        data-testid={ThreadColumnsTestId.sectionsColumn}
        heading={SECTIONS_COLUMN_HEADING}
        message={SECTIONS_COLUMN_MESSAGE}
      />

      <ThreadColumn
        data-testid={ThreadColumnsTestId.pagesColumn}
        heading={PAGES_COLUMN_HEADING}
        message={PAGES_COLUMN_MESSAGE}
      />

      <ThreadColumn
        data-testid={ThreadColumnsTestId.contentColumn}
        message={CONTENT_COLUMN_MESSAGE}
        isCentered
      />
    </Box>
  );
};

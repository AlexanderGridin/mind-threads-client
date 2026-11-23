import { Box } from "@/components/lib";
import { PageView, PagesColumn, SectionsColumn } from "./components";
import {
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

      <PagesColumn />

      <PageView />
    </Box>
  );
};

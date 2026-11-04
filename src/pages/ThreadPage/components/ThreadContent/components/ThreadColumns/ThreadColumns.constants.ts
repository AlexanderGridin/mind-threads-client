import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadColumns__");

export const ThreadColumnsTestId = {
  container: createTestId("container"),
  sectionsColumn: createTestId("sections-column"),
  pagesColumn: createTestId("pages-column"),
  contentColumn: createTestId("content-column"),
} as const;

export const THREAD_COLUMNS_TEMPLATE = "280px 280px 1fr";

export const SECTIONS_COLUMN_HEADING = "Sections";
export const SECTIONS_COLUMN_MESSAGE = "No sections yet.";
export const PAGES_COLUMN_HEADING = "Pages";
export const PAGES_COLUMN_MESSAGE = "Select a section to see its pages.";
export const CONTENT_COLUMN_MESSAGE = "Select a page to see its content.";

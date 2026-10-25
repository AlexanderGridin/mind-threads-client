import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("EmptyThreadList__");

export const EmptyThreadListTestId = {
  container: createTestId("container"),
  message: createTestId("message"),
  addButton: createTestId("add-button"),
} as const;

export const EMPTY_THREAD_LIST_MESSAGE =
  "No threads yet. Create your first thread to get started.";
export const EMPTY_THREAD_LIST_BUTTON_LABEL = "Add new thread";

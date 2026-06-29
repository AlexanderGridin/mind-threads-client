import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MindThreadList__");

export const MindThreadListTestId = {
  container: createTestId("container"),
  listItem: createTestId("list-item"),
} as const;

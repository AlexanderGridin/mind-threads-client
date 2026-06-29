import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadListModeButton__");

export const ThreadListModeButtonTestId = {
  container: createTestId("container"),
  gridIcon: createTestId("grid-icon"),
  listIcon: createTestId("list-icon"),
} as const;

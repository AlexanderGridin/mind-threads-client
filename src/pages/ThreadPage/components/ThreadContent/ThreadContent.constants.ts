import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadContent__");

export const ThreadContentTestId = {
  container: createTestId("container"),
} as const;

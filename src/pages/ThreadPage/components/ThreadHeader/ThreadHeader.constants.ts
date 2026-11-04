import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadHeader__");

export const ThreadHeaderTestId = {
  container: createTestId("container"),
  title: createTestId("title"),
} as const;

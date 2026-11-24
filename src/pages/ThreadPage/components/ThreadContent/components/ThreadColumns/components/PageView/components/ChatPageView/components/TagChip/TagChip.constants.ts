import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("TagChip__");

export const TagChipTestId = {
  container: createTestId("container"),
  name: createTestId("name"),
} as const;

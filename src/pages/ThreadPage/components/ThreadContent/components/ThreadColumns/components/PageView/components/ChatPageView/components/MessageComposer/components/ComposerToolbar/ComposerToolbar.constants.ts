import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ComposerToolbar__");

export const ComposerToolbarTestId = {
  container: createTestId("container"),
  divider: createTestId("divider"),
} as const;

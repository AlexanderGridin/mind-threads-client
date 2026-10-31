import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("BackToDashboardIconButton__");

export const BackToDashboardIconButtonTestId = {
  container: createTestId("container"),
} as const;

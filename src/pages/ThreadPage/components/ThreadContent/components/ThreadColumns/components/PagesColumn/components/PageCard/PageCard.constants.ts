import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("PageCard__");

export const PageCardTestId = {
  container: createTestId("container"),
  name: createTestId("name"),
} as const;

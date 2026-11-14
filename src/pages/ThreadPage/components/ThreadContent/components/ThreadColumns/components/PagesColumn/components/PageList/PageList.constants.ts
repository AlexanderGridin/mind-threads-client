import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("PageList__");

export const PageListTestId = {
  container: createTestId("container"),
};

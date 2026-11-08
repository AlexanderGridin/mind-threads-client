import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("SectionList__");

export const SectionListTestId = {
  container: createTestId("container"),
};

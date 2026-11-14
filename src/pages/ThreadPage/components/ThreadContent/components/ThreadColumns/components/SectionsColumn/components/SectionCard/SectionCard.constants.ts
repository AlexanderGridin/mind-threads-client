import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("SectionCard__");

export const SectionCardTestId = {
  container: createTestId("container"),
  name: createTestId("name"),
  selectButton: createTestId("select-button"),
};

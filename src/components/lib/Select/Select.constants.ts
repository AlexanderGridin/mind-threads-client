import { initTestIdCreator } from "../utils";

const createTestId = initTestIdCreator("Select__");

export const SelectTestId = {
  container: createTestId("container"),
  trigger: createTestId("trigger"),
  content: createTestId("content"),
  item: createTestId("item"),
};

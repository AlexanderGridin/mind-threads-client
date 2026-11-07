import { initTestIdCreator } from "../utils";

const createTestId = initTestIdCreator("TruncatedText__");

export const TruncatedTextTestId = {
  text: createTestId("text"),
  tooltip: createTestId("tooltip"),
};

import { initTestIdCreator } from "../utils";

const createTestId = initTestIdCreator("FullScreenLoader__");

export const FullScreenLoaderTestId = {
  container: createTestId("container"),
} as const;

import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ColorModeButton__");

export const ColorModeButtonTestId = {
  container: createTestId("container"),
} as const;

import { initTestIdCreator } from "../../../utils";

const createTestId = initTestIdCreator("ColorModeIcon__");

export const ColorModeIconTestId = {
  darkIcon: createTestId("dark-icon"),
  lightIcon: createTestId("lign-icon"),
} as const;

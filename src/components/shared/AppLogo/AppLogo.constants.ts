import { initTestIdCreator } from "@/components/lib/utils";

export const APP_NAME = "Mind Threads";

const createTestId = initTestIdCreator("AppLogo__");

export const AppLogoTestId = {
  container: createTestId("container"),
  icon: createTestId("icon"),
  text: createTestId("text"),
} as const;

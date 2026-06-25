import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("DashboardHeader__");

export const DashboardHeaderTestId = {
  container: createTestId("container"),
} as const;

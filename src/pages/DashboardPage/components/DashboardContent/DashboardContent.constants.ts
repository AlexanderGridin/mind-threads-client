import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("DashboardContent__");

export const DashboardContentTestId = {
  container: createTestId("container"),
} as const;

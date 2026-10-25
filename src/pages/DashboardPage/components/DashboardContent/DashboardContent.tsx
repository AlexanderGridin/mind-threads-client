import { Box } from "@/components/lib";
import { ThreadsSection } from "./components";
import { DashboardContentTestId } from "./DashboardContent.constants";

export const DashboardContent = () => {
  return (
    <Box
      data-testid={DashboardContentTestId.container}
      as="main"
      backgroundColor="bg.muted"
      px="6"
      py="6"
      flexGrow={1}
    >
      <ThreadsSection />
    </Box>
  );
};

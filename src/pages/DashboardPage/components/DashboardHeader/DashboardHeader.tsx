import { HStack, ColorModeButton } from "@/components/lib";
import { DashboardHeaderTestId } from "./DashboardHeader.constants";
import { AppLogo } from "./components";

export const DashboardHeader = () => {
  return (
    <HStack
      as="header"
      data-testid={DashboardHeaderTestId.container}
      justifyContent="space-between"
      alignItems="center"
      px="6"
      py="4"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <AppLogo />
      <ColorModeButton />
    </HStack>
  );
};

import { Box } from "@chakra-ui/react";
import { LuBrainCircuit } from "react-icons/lu";
import { HStack, Text } from "@/components/lib";
import { APP_NAME, AppLogoTestId } from "./AppLogo.constants";

export const AppLogo = () => {
  return (
    <HStack data-testid={AppLogoTestId.container} gap="3" alignItems="center">
      <Box
        border="1px"
        borderColor="border"
        backgroundColor="bg.muted"
        borderRadius="md"
        padding="2"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <LuBrainCircuit data-testid={AppLogoTestId.icon} size={28} />
      </Box>

      <Text
        data-testid={AppLogoTestId.text}
        as="h1"
        fontSize="md"
        fontWeight="semibold"
        color="fg"
      >
        {APP_NAME}
      </Text>
    </HStack>
  );
};

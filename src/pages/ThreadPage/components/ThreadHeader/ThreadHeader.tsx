import { Box, ColorModeButton, HStack, Text } from "@/components/lib";
import { AppLogo, ContrastColorScope } from "@/components/shared";
import type { MindThread } from "@/types";
import { BackToDashboardIconButton } from "./components";
import { ThreadHeaderTestId } from "./ThreadHeader.constants";

type ThreadHeaderProps = {
  thread: MindThread | null;
};

export const ThreadHeader = ({ thread }: ThreadHeaderProps) => {
  const backgroundColor = thread?.color;

  return (
    <Box
      as="header"
      data-testid={ThreadHeaderTestId.container}
      display="grid"
      gridTemplateColumns="1fr auto 1fr"
      alignItems="center"
      gap="4"
      px="6"
      py="4"
      borderBottomWidth="1px"
      borderColor="border"
      backgroundColor={backgroundColor}
    >
      <ContrastColorScope backgroundColor={backgroundColor}>
        <AppLogo />

        <HStack gap="3" minWidth="0">
          <BackToDashboardIconButton />

          {thread ? (
            <Text
              data-testid={ThreadHeaderTestId.title}
              as="h2"
              fontSize="lg"
              fontWeight="semibold"
              color="fg"
              truncate
            >
              {thread.title}
            </Text>
          ) : null}
        </HStack>

        <HStack justifyContent="flex-end">
          <ColorModeButton />
        </HStack>
      </ContrastColorScope>
    </Box>
  );
};

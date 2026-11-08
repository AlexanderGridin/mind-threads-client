import type { ReactNode } from "react";
import { Box, HStack, Text } from "@/components/lib";

type ThreadColumnProps = {
  "data-testid"?: string;
  heading?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  isCentered?: boolean;
};

export const ThreadColumn = ({
  "data-testid": dataTestId,
  heading,
  headerAction,
  children,
  isCentered = false,
}: ThreadColumnProps) => {
  const alignItems = isCentered ? "center" : "stretch";
  const justifyContent = isCentered ? "center" : "flex-start";

  return (
    <Box
      as="section"
      data-testid={dataTestId}
      display="flex"
      flexDirection="column"
      gap="3"
      p="4"
      minWidth="0"
      minHeight="0"
    >
      {heading ? (
        <HStack justifyContent="space-between" gap="2">
          <Text as="h3" fontSize="md" fontWeight="semibold" color="fg">
            {heading}
          </Text>

          {headerAction}
        </HStack>
      ) : null}

      <Box
        display="flex"
        flexDirection="column"
        alignItems={alignItems}
        justifyContent={justifyContent}
        flexGrow={1}
        minHeight="0"
        overflowY="auto"
      >
        {children}
      </Box>
    </Box>
  );
};

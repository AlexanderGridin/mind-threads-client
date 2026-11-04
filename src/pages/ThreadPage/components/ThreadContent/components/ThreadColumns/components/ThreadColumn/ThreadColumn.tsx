import { Box, Text } from "@/components/lib";

type ThreadColumnProps = {
  "data-testid"?: string;
  heading?: string;
  message: string;
  isCentered?: boolean;
};

export const ThreadColumn = ({
  "data-testid": dataTestId,
  heading,
  message,
  isCentered = false,
}: ThreadColumnProps) => {
  const alignment = isCentered ? "center" : "flex-start";

  return (
    <Box
      as="section"
      data-testid={dataTestId}
      display="flex"
      flexDirection="column"
      alignItems={alignment}
      justifyContent={alignment}
      gap="3"
      p="4"
      minWidth="0"
    >
      {heading ? (
        <Text as="h3" fontSize="md" fontWeight="semibold" color="fg">
          {heading}
        </Text>
      ) : null}

      <Text color="fg.muted">{message}</Text>
    </Box>
  );
};

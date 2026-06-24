import { Box, Text } from "@chakra-ui/react";

import { useColorModeValue } from "@/components/lib";

export const HomePage = () => {
  const labelText = useColorModeValue(
    "Light mode is active",
    "Dark mode is active"
  );

  return (
    <>
      <h1>HomePage</h1>

      <Box bg="bg.subtle" p="4" mt="4" borderRadius="md">
        <Text>{labelText}</Text>
      </Box>
    </>
  );
};

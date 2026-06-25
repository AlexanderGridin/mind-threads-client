import {
  Badge,
  Box,
  Button,
  Card,
  Link,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";

import { useColorModeValue } from "@/components/lib";

export const ColorsDemoPage = () => {
  const labelText = useColorModeValue(
    "Light mode is active",
    "Dark mode is active"
  );

  return (
    <>
      <h1>Colors Demo</h1>

      <Box bg="bg.subtle" p="4" mt="4" borderRadius="md">
        <Text>{labelText}</Text>
      </Box>

      <VStack gap="6" mt="8" align="stretch">
        <Card.Root bg="bg" borderColor="border" borderWidth="1px">
          <Card.Body gap="4">
            <Text fontSize="lg" fontWeight="bold" color="fg">
              Nord Theme Showcase
            </Text>
            <Text color="fg.muted">
              This page demonstrates the Nord color theme with various Chakra UI
              components.
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="bg.subtle" borderColor="border.subtle" borderWidth="1px">
          <Card.Body gap="4">
            <Text fontSize="md" fontWeight="bold" color="fg">
              Buttons
            </Text>
            <HStack gap="2" flexWrap="wrap">
              <Button bg="accent" color="accent.fg" _hover={{ opacity: 0.8 }}>
                Primary
              </Button>
              <Button variant="outline" borderColor="border" color="fg">
                Secondary
              </Button>
              <Button bg="red" color="fg">
                Danger
              </Button>
              <Button bg="green" color="fg">
                Success
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="bg.subtle" borderColor="border.subtle" borderWidth="1px">
          <Card.Body gap="4">
            <Text fontSize="md" fontWeight="bold" color="fg">
              Status Badges
            </Text>
            <HStack gap="2" flexWrap="wrap">
              <Badge bg="red" color="fg">
                Error
              </Badge>
              <Badge bg="yellow" color="fg">
                Warning
              </Badge>
              <Badge bg="green" color="fg">
                Success
              </Badge>
              <Badge bg="orange" color="fg">
                Info
              </Badge>
              <Badge bg="purple" color="fg">
                Custom
              </Badge>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="bg.subtle" borderColor="border.subtle" borderWidth="1px">
          <Card.Body gap="4">
            <Text fontSize="md" fontWeight="bold" color="fg">
              Links and Text
            </Text>
            <VStack gap="2" align="flex-start">
              <Link color="accent" _hover={{ textDecoration: "underline" }}>
                Primary Link
              </Link>
              <Text color="fg">Default text color</Text>
              <Text color="fg.muted">Muted text color</Text>
              <Text color="accent.subtle">Accent subtle text</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="bg.subtle" borderColor="border.subtle" borderWidth="1px">
          <Card.Body gap="4">
            <Text fontSize="md" fontWeight="bold" color="fg">
              Color Palette
            </Text>
            <HStack gap="2" flexWrap="wrap">
              <Box w="12" h="12" bg="red" title="red" />
              <Box w="12" h="12" bg="orange" title="orange" />
              <Box w="12" h="12" bg="yellow" title="yellow" />
              <Box w="12" h="12" bg="green" title="green" />
              <Box w="12" h="12" bg="purple" title="purple" />
              <Box w="12" h="12" bg="accent" title="accent" />
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </>
  );
};

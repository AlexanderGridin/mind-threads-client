import { useState } from "react";
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

import {
  useColorModeValue,
  Input,
  ColorPicker,
  Dialog,
  ColorModeButton,
} from "@/components/lib";
import { DemoCard } from "./DemoCard";
import { AppLogo } from "@/components/shared";
import { Link as RouterLink } from "react-router";

export const ColorsDemoPage = () => {
  const labelText = useColorModeValue(
    "Light mode is active",
    "Dark mode is active"
  );

  const [inputValue, setInputValue] = useState("");
  const [colorValue, setColorValue] = useState("#bf616a");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  return (
    <Box padding="16px">
      <HStack justifyContent="space-between" style={{ marginBottom: "25px" }}>
        <RouterLink to="/">
          <AppLogo />
        </RouterLink>

        <ColorModeButton />
      </HStack>

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

        <DemoCard title="Buttons">
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
        </DemoCard>

        <DemoCard title="Status Badges">
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
        </DemoCard>

        <DemoCard title="Links and Text">
          <VStack gap="2" align="flex-start">
            <Link color="accent" _hover={{ textDecoration: "underline" }}>
              Primary Link
            </Link>
            <Text color="fg">Default text color</Text>
            <Text color="fg.muted">Muted text color</Text>
            <Text color="accent.subtle">Accent subtle text</Text>
          </VStack>
        </DemoCard>

        <DemoCard title="Color Palette">
          <HStack gap="2" flexWrap="wrap">
            <Box w="12" h="12" bg="red" title="red" />
            <Box w="12" h="12" bg="orange" title="orange" />
            <Box w="12" h="12" bg="yellow" title="yellow" />
            <Box w="12" h="12" bg="green" title="green" />
            <Box w="12" h="12" bg="purple" title="purple" />
            <Box w="12" h="12" bg="accent" title="accent" />
          </HStack>
        </DemoCard>

        <DemoCard title="Input">
          <Input
            value={inputValue}
            onChange={setInputValue}
            placeholder="Enter text..."
          />
          <Text color="fg.muted" fontSize="sm">
            Current value: {inputValue || "(empty)"}
          </Text>
        </DemoCard>

        <DemoCard title="Color Picker">
          <ColorPicker
            label="Accent color"
            value={colorValue}
            onChange={setColorValue}
          />
          <Text color="fg.muted" fontSize="sm">
            Current value: {colorValue}
          </Text>
        </DemoCard>

        <DemoCard title="Dialog">
          <Button bg="accent" color="accent.fg" onClick={handleOpenDialog}>
            Open Dialog
          </Button>
          <Dialog
            open={dialogOpen}
            title="Dialog Title"
            content="This is a dialog content example."
            actions={
              <Button bg="accent" color="accent.fg" onClick={handleCloseDialog}>
                Close
              </Button>
            }
            onClose={handleCloseDialog}
          />
        </DemoCard>
      </VStack>
    </Box>
  );
};

import {
  IconButton as ChakraIconButton,
  Menu as ChakraMenu,
  Portal,
} from "@chakra-ui/react";
import type { MenuProps } from "./Menu.types";

export const Menu = ({
  triggerLabel,
  triggerIcon,
  items,
  "data-testid": dataTestId,
}: MenuProps) => {
  const handleSelect = ({ value }: { value: string }) => {
    const selectedItem = items.find((item) => item.value === value);
    selectedItem?.onSelect();
  };

  return (
    <ChakraMenu.Root onSelect={handleSelect}>
      <ChakraMenu.Trigger asChild>
        <ChakraIconButton
          variant="ghost"
          size="sm"
          aria-label={triggerLabel}
          data-testid={dataTestId}
        >
          {triggerIcon}
        </ChakraIconButton>
      </ChakraMenu.Trigger>

      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content>
            {items.map((item) => (
              <ChakraMenu.Item
                key={item.value}
                value={item.value}
                color={item.color}
              >
                {item.label}
              </ChakraMenu.Item>
            ))}
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
};

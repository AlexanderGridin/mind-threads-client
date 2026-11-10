import {
  Portal,
  Select as ChakraSelect,
  createListCollection,
} from "@chakra-ui/react";
import { Box } from "../Box";
import { SelectTestId } from "./Select.constants";
import type { SelectItem } from "./Select.types";

export type SelectProps<Value extends string> = {
  label: string;
  value: Value;
  items: SelectItem<Value>[];
  onChange: (value: Value) => void;
  "data-testid"?: string;
  portal?: boolean;
  disabled?: boolean;
};

export const Select = <Value extends string>({
  label,
  value,
  items,
  "data-testid": testId,
  portal = true,
  disabled = false,
  onChange,
}: SelectProps<Value>) => {
  const collection = createListCollection({ items });

  const selectedItem = items.find((item) => {
    return item.value === value;
  });

  const handleValueChange = (
    details: ChakraSelect.ValueChangeDetails<SelectItem<Value>>
  ) => {
    const [changedItem] = details.items;

    if (changedItem) {
      onChange(changedItem.value);
    }
  };

  const content = (
    <ChakraSelect.Positioner>
      <ChakraSelect.Content data-testid={SelectTestId.content}>
        {items.map((item) => {
          return (
            <ChakraSelect.Item
              key={item.value}
              item={item}
              data-testid={SelectTestId.item}
            >
              {item.icon}

              <ChakraSelect.ItemText flexGrow={1}>
                {item.label}
              </ChakraSelect.ItemText>

              <ChakraSelect.ItemIndicator />
            </ChakraSelect.Item>
          );
        })}
      </ChakraSelect.Content>
    </ChakraSelect.Positioner>
  );

  return (
    <ChakraSelect.Root
      data-testid={testId ?? SelectTestId.container}
      collection={collection}
      value={[value]}
      width="100%"
      disabled={disabled}
      onValueChange={handleValueChange}
    >
      <ChakraSelect.HiddenSelect />
      <ChakraSelect.Label>{label}</ChakraSelect.Label>

      <ChakraSelect.Control>
        <ChakraSelect.Trigger
          data-testid={SelectTestId.trigger}
          _hover={{ borderColor: "accent", cursor: "pointer" }}
          _focus={{ borderColor: "accent", outlineColor: "accent" }}
        >
          <ChakraSelect.ValueText>
            <Box as="span" display="flex" alignItems="center" gap="2">
              {selectedItem?.icon}
              {selectedItem?.label}
            </Box>
          </ChakraSelect.ValueText>
        </ChakraSelect.Trigger>

        <ChakraSelect.IndicatorGroup>
          <ChakraSelect.Indicator />
        </ChakraSelect.IndicatorGroup>
      </ChakraSelect.Control>

      {portal ? <Portal>{content}</Portal> : content}
    </ChakraSelect.Root>
  );
};

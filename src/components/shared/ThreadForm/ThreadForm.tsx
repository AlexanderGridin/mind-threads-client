import { VStack, Input, ColorPicker } from "@/components/lib";
import {
  ThreadFormTestId,
  THREAD_NAME_PLACEHOLDER,
  THREAD_COLOR_LABEL,
  THREAD_NAME_LABEL,
} from "./ThreadForm.constants";
import type { ThreadFormProps } from "./ThreadForm.types";

export const ThreadForm = ({
  value,
  disabled = false,
  onChange,
}: ThreadFormProps) => {
  const handleTitleChange = (title: string) => {
    onChange({ ...value, title });
  };

  const handleColorChange = (color: string) => {
    onChange({ ...value, color });
  };

  return (
    <VStack
      data-testid={ThreadFormTestId.form}
      as="form"
      gap="4"
      alignItems="flex-start"
    >
      <Input
        data-testid={ThreadFormTestId.titleInput}
        value={value.title}
        label={THREAD_NAME_LABEL}
        required
        placeholder={THREAD_NAME_PLACEHOLDER}
        disabled={disabled}
        onChange={handleTitleChange}
      />

      <ColorPicker
        data-testid={ThreadFormTestId.colorPicker}
        label={THREAD_COLOR_LABEL}
        value={value.color}
        portal={false}
        fullWidth
        disabled={disabled}
        onChange={handleColorChange}
      />
    </VStack>
  );
};

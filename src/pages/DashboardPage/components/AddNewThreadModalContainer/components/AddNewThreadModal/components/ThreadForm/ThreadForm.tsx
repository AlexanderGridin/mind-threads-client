import { VStack, Input, ColorPicker } from "@/components/lib";
import type { ThreadFormValue } from "../../AddNewThreadModal.types";
import {
  ThreadFormTestId,
  THREAD_NAME_PLACEHOLDER,
  THREAD_COLOR_LABEL,
  THREAD_NAME_LABEL,
} from "./ThreadForm.constants";

export type ThreadFormProps = {
  value: ThreadFormValue;
  onChange: (value: ThreadFormValue) => void;
};

export const ThreadForm = ({ value, onChange }: ThreadFormProps) => {
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
        onChange={handleTitleChange}
      />

      <ColorPicker
        data-testid={ThreadFormTestId.colorPicker}
        label={THREAD_COLOR_LABEL}
        value={value.color}
        portal={false}
        fullWidth
        onChange={handleColorChange}
      />
    </VStack>
  );
};

import type { FormEvent, RefObject } from "react";
import { VStack, Input, ColorPicker } from "@/components/lib";
import type { ThreadSectionValue } from "@/types";
import {
  SectionFormTestId,
  SECTION_COLOR_LABEL,
  SECTION_NAME_LABEL,
  SECTION_NAME_PLACEHOLDER,
} from "./SectionForm.constants";

type SectionFormProps = {
  formId: string;
  value: ThreadSectionValue;
  nameInputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  onChange: (value: ThreadSectionValue) => void;
  onSubmit: () => void;
};

export const SectionForm = ({
  formId,
  value,
  nameInputRef,
  disabled = false,
  onChange,
  onSubmit,
}: SectionFormProps) => {
  const handleNameChange = (name: string) => {
    onChange({ ...value, name });
  };

  const handleColorChange = (color: string) => {
    onChange({ ...value, color });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <VStack
      data-testid={SectionFormTestId.form}
      id={formId}
      as="form"
      gap="4"
      alignItems="flex-start"
      onSubmit={handleSubmit}
    >
      <Input
        ref={nameInputRef}
        data-testid={SectionFormTestId.nameInput}
        value={value.name}
        label={SECTION_NAME_LABEL}
        required
        placeholder={SECTION_NAME_PLACEHOLDER}
        disabled={disabled}
        onChange={handleNameChange}
      />

      <ColorPicker
        data-testid={SectionFormTestId.colorPicker}
        label={SECTION_COLOR_LABEL}
        value={value.color}
        portal={false}
        fullWidth
        disabled={disabled}
        onChange={handleColorChange}
      />
    </VStack>
  );
};

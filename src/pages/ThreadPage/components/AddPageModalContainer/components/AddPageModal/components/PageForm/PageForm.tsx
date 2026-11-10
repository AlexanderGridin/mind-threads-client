import type { FormEvent, RefObject } from "react";
import { VStack, Input, ColorPicker, Select } from "@/components/lib";
import {
  PAGE_TYPES,
  PAGE_TYPE_CONFIG,
} from "@/pages/ThreadPage/ThreadPage.constants";
import { PageTypeIcon } from "@/pages/ThreadPage/components/PageTypeIcon";
import type { SectionPageType, SectionPageValue } from "@/types";
import {
  PageFormTestId,
  PAGE_COLOR_LABEL,
  PAGE_NAME_LABEL,
  PAGE_NAME_PLACEHOLDER,
  PAGE_TYPE_LABEL,
} from "./PageForm.constants";

type PageFormProps = {
  formId: string;
  value: SectionPageValue;
  nameInputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  onChange: (value: SectionPageValue) => void;
  onSubmit: () => void;
};

export const PageForm = ({
  formId,
  value,
  nameInputRef,
  disabled = false,
  onChange,
  onSubmit,
}: PageFormProps) => {
  const handleNameChange = (name: string) => {
    onChange({ ...value, name });
  };

  const handleTypeChange = (type: SectionPageType) => {
    onChange({ ...value, type });
  };

  const handleColorChange = (color: string) => {
    onChange({ ...value, color });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const pageTypeItems = PAGE_TYPES.map((type) => {
    return {
      value: type,
      label: PAGE_TYPE_CONFIG[type].label,
      icon: <PageTypeIcon type={type} />,
    };
  });

  return (
    <VStack
      data-testid={PageFormTestId.form}
      id={formId}
      as="form"
      gap="4"
      alignItems="flex-start"
      onSubmit={handleSubmit}
    >
      <Input
        ref={nameInputRef}
        data-testid={PageFormTestId.nameInput}
        value={value.name}
        label={PAGE_NAME_LABEL}
        required
        placeholder={PAGE_NAME_PLACEHOLDER}
        disabled={disabled}
        onChange={handleNameChange}
      />

      <Select
        data-testid={PageFormTestId.typeSelect}
        label={PAGE_TYPE_LABEL}
        value={value.type}
        items={pageTypeItems}
        portal={false}
        disabled={disabled}
        onChange={handleTypeChange}
      />

      <ColorPicker
        data-testid={PageFormTestId.colorPicker}
        label={PAGE_COLOR_LABEL}
        value={value.color}
        portal={false}
        fullWidth
        disabled={disabled}
        onChange={handleColorChange}
      />
    </VStack>
  );
};

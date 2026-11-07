import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("SectionForm__");

export const SectionFormTestId = {
  form: createTestId("form"),
  nameInput: createTestId("name-input"),
  colorPicker: createTestId("color-picker"),
} as const;

export const SECTION_NAME_LABEL = "Section name";
export const SECTION_NAME_PLACEHOLDER = "Enter section name";
export const SECTION_COLOR_LABEL = "Color";

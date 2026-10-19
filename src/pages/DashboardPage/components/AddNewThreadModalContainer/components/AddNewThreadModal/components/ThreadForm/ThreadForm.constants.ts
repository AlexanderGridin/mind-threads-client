import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadForm__");

export const ThreadFormTestId = {
  form: createTestId("form"),
  titleInput: createTestId("title-input"),
  colorPicker: createTestId("color-picker"),
} as const;

export const THREAD_NAME_LABEL = "Thread name";
export const THREAD_NAME_PLACEHOLDER = "Enter thread name";
export const THREAD_COLOR_LABEL = "Color";

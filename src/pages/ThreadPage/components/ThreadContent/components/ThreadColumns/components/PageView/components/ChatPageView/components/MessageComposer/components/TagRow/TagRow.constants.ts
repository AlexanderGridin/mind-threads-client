import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("TagRow__");

export const TagRowTestId = {
  container: createTestId("container"),
  input: createTestId("input"),
} as const;

export const TAG_INPUT_LABEL = "Tag name";
export const TAG_INPUT_PLACEHOLDER = "tag name, Enter to add…";

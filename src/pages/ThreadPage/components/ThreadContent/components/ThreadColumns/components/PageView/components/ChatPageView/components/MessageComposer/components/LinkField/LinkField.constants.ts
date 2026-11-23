import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("LinkField__");

export const LinkFieldTestId = {
  container: createTestId("container"),
  input: createTestId("input"),
} as const;

export const LINK_URL_LABEL = "Link URL";
export const LINK_URL_PLACEHOLDER = "https://…";
export const CONFIRM_LINK_LABEL = "Add link";
export const CANCEL_LINK_LABEL = "Cancel";

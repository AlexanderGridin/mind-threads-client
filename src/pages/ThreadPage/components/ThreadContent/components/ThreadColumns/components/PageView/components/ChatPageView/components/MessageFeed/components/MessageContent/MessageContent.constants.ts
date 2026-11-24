import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MessageContent__");

export const MessageContentTestId = {
  container: createTestId("container"),
} as const;

export const MESSAGE_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "a",
  "img",
];

export const MESSAGE_ALLOWED_ATTRIBUTES = ["href", "src", "alt"];
export const MESSAGE_ALLOWED_URI_PATTERN = /^https?:/i;
export const LINK_TAG_NAME = "A";
export const LINK_TARGET = "_blank";
export const LINK_REL = "noopener noreferrer";

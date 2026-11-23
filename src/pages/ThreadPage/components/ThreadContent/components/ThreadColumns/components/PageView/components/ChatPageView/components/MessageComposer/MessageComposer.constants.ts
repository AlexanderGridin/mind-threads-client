import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MessageComposer__");

export const MessageComposerTestId = {
  container: createTestId("container"),
  editorArea: createTestId("editor-area"),
  editor: createTestId("editor"),
  imageInput: createTestId("image-input"),
} as const;

export const COMPOSER_PLACEHOLDER = "Write a message… (Ctrl+Enter to send)";
export const COMPOSER_EDITOR_LABEL = "Message";
export const COMPOSER_EDITOR_MAX_HEIGHT = "16rem";
export const CODE_BLOCK_PLACEHOLDER = "// Enter code here";
export const IMAGE_FILE_ACCEPT = "image/*";
export const IMAGE_MIME_PREFIX = "image/";
export const ALLOWED_LINK_PROTOCOLS = ["http:", "https:"];
export const CONTENT_NODE_TYPES = ["image", "codeBlock"];
// Must be higher than Tiptap's default priority (100), so the composer shortcuts
// run before StarterKit's own Mod-b and Mod-Enter (hard break) bindings.
export const COMPOSER_SHORTCUTS_PRIORITY = 1000;

export const INVALID_LINK_URL_MESSAGE = "Enter a valid http or https URL";
export const UNSUPPORTED_IMAGE_MESSAGE = "Only image files are supported.";
export const IMAGE_LOAD_ERROR_MESSAGE =
  "Couldn't load the image. Please try again.";
export const FILE_READ_ERROR_MESSAGE = "File could not be read";
export const FILE_READ_INVALID_RESULT_MESSAGE =
  "File could not be read as a data URL";
export const FILE_READ_ABORTED_MESSAGE = "File reading was aborted";

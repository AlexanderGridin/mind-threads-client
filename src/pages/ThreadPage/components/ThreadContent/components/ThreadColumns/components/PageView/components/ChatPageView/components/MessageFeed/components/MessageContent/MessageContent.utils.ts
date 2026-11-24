import DOMPurify from "dompurify";
import {
  LINK_REL,
  LINK_TAG_NAME,
  LINK_TARGET,
  MESSAGE_ALLOWED_ATTRIBUTES,
  MESSAGE_ALLOWED_TAGS,
  MESSAGE_ALLOWED_URI_PATTERN,
} from "./MessageContent.constants";

// A dedicated instance, so the link hook below does not leak into other
// DOMPurify users.
const messagePurifier = DOMPurify(window);

messagePurifier.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === LINK_TAG_NAME) {
    node.setAttribute("target", LINK_TARGET);
    node.setAttribute("rel", LINK_REL);
  }
});

export const sanitizeMessageContent = (content: string) => {
  return messagePurifier.sanitize(content, {
    ALLOWED_TAGS: MESSAGE_ALLOWED_TAGS,
    ALLOWED_ATTR: MESSAGE_ALLOWED_ATTRIBUTES,
    ALLOWED_URI_REGEXP: MESSAGE_ALLOWED_URI_PATTERN,
  });
};

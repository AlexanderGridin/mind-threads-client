import { MESSAGE_DATE_FORMAT_OPTIONS } from "./MessageItem.constants";

const messageDateFormatter = new Intl.DateTimeFormat(
  undefined,
  MESSAGE_DATE_FORMAT_OPTIONS
);

export const formatMessageDate = (createdAt: string) => {
  return messageDateFormatter.format(new Date(createdAt));
};

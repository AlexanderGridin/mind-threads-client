import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { chatMessageFixtures, isFollowing } from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import type { ChatMessage } from "@/types";
import { MessageItem } from "../MessageItem";
import {
  MESSAGE_DATE_FORMAT_OPTIONS,
  MessageItemTestId,
} from "../MessageItem.constants";
import { MessageContentTestId } from "../../MessageContent/MessageContent.constants";

const MESSAGE_WITH_TAGS = chatMessageFixtures[0];
const MESSAGE_WITHOUT_TAGS = chatMessageFixtures[1];

const EXPECTED_DATE = new Intl.DateTimeFormat(
  undefined,
  MESSAGE_DATE_FORMAT_OPTIONS
).format(new Date(MESSAGE_WITH_TAGS.createdAt));

const setup = (message: ChatMessage) => {
  renderWithUIProvider(<MessageItem message={message} />);
};

const getSentAt = () => {
  return screen.getByTestId(MessageItemTestId.sentAt);
};

const getTags = () => {
  return screen.getByTestId(MessageItemTestId.tags);
};

const getContent = () => {
  return screen.getByTestId(MessageContentTestId.container);
};

describe("MessageItem", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the formatted date, the tag chips and the content, in that order", () => {
    setup(MESSAGE_WITH_TAGS);

    const sentAt = getSentAt();
    const tags = getTags();
    const content = getContent();

    expect(sentAt.textContent).toBe(EXPECTED_DATE);
    expect(isFollowing({ element: tags, previousElement: sentAt })).toBe(true);
    expect(isFollowing({ element: content, previousElement: tags })).toBe(true);
  });

  it("shows no tags block for a message without tags, and the content follows the date", () => {
    setup(MESSAGE_WITHOUT_TAGS);

    const sentAt = getSentAt();
    const tags = screen.queryByTestId(MessageItemTestId.tags);
    const content = getContent();

    expect(tags).not.toBeInTheDocument();
    expect(isFollowing({ element: content, previousElement: sentAt })).toBe(
      true
    );
  });

  it("shows the tag chips without remove buttons", () => {
    setup(MESSAGE_WITH_TAGS);

    const removeButtons = screen.queryAllByRole("button");
    expect(removeButtons).toStrictEqual([]);
  });

  it("lays the tags out in a wrapping row", () => {
    setup(MESSAGE_WITH_TAGS);

    const tags = getTags();
    expect(tags).toHaveStyle({ flexWrap: "wrap" });
  });
});

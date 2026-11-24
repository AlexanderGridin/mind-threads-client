import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  buildPageMessages,
  getFeedMessageContents,
  sectionPageFixtures,
  stubVirtualizerLayout,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import type { ChatMessage } from "@/types";
import { MessageList } from "../MessageList";
import { MessageListTestId } from "../MessageList.constants";

const LARGE_MESSAGE_COUNT = 5000;
const MAX_RENDERED_ROWS = 30;
const SCROLL_TOP = 2000;
const PAGE = sectionPageFixtures[0];

type SetupParams = {
  messages: ChatMessage[];
};

const setup = ({ messages }: SetupParams) => {
  renderWithUIProvider(<MessageList messages={messages} />);
};

const getRows = () => {
  return screen.queryAllByTestId(MessageListTestId.row);
};

const getScrollContainer = () => {
  return screen.getByTestId(MessageListTestId.container);
};

describe("MessageList", () => {
  beforeEach(() => {
    stubVirtualizerLayout();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the given messages in the given order", () => {
    const messages = buildPageMessages({ page: PAGE, count: 3 });

    setup({ messages });

    const expectedContents = ["Message 0", "Message 1", "Message 2"];
    expect(getFeedMessageContents()).toStrictEqual(expectedContents);
  });

  it("renders far fewer rows than the messages, starting with the newest", () => {
    const messages = buildPageMessages({
      page: PAGE,
      count: LARGE_MESSAGE_COUNT,
    });

    setup({ messages });

    const rows = getRows();
    const firstRow = rows[0];

    expect(rows.length).toBeLessThan(MAX_RENDERED_ROWS);
    expect(firstRow.getAttribute("data-index")).toBe("0");
    expect(getFeedMessageContents()[0]).toBe("Message 0");
  });

  it("renders the later messages after scrolling and drops the first ones", () => {
    const messages = buildPageMessages({
      page: PAGE,
      count: LARGE_MESSAGE_COUNT,
    });

    setup({ messages });

    const scrollContainer = getScrollContainer();
    Object.defineProperty(scrollContainer, "scrollTop", {
      value: SCROLL_TOP,
      configurable: true,
    });

    fireEvent.scroll(scrollContainer);

    const laterMessage = screen.getByText("Message 20");
    const firstMessage = screen.queryByText("Message 0");

    expect(laterMessage).toBeInTheDocument();
    expect(firstMessage).not.toBeInTheDocument();
  });

  it("gives each row its data-index", () => {
    const messages = buildPageMessages({ page: PAGE, count: 3 });

    setup({ messages });

    const rowIndexes = getRows().map((row) => {
      return row.getAttribute("data-index");
    });

    expect(rowIndexes).toStrictEqual(["0", "1", "2"]);
  });
});

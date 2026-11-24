import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  chatMessageFixtures,
  getTryAgainButton,
  stubVirtualizerLayout,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import type { ChatMessage } from "@/types";
import { MessageFeed } from "../MessageFeed";
import {
  EMPTY_FEED_MESSAGE,
  LOADING_MESSAGES_LABEL,
} from "../MessageFeed.constants";
import { MessagesStatus } from "../../../ChatPageView.constants";
import type { MessagesStatusType } from "../../../ChatPageView.types";
import { MessageListTestId } from "../components/MessageList/MessageList.constants";
import { MessagesLoadErrorTestId } from "../components/MessagesLoadError/MessagesLoadError.constants";

type SetupParams = {
  messages?: ChatMessage[];
  messagesStatus: MessagesStatusType;
};

const setup = ({ messages = [], messagesStatus }: SetupParams) => {
  const user = userEvent.setup();
  const onRetry = vi.fn();

  renderWithUIProvider(
    <MessageFeed
      messages={messages}
      messagesStatus={messagesStatus}
      onRetry={onRetry}
    />
  );

  return { user, onRetry };
};

const queryLoader = () => {
  return screen.queryByRole("status", { name: LOADING_MESSAGES_LABEL });
};

const queryEmptyMessage = () => {
  return screen.queryByText(EMPTY_FEED_MESSAGE);
};

const queryList = () => {
  return screen.queryByTestId(MessageListTestId.container);
};

const queryLoadError = () => {
  return screen.queryByTestId(MessagesLoadErrorTestId.container);
};

describe("MessageFeed", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only the loader while loading", () => {
    setup({ messagesStatus: MessagesStatus.Loading });

    const loader = queryLoader();
    const emptyMessage = queryEmptyMessage();
    const list = queryList();
    const loadError = queryLoadError();

    expect(loader).toBeInTheDocument();
    expect(emptyMessage).not.toBeInTheDocument();
    expect(list).not.toBeInTheDocument();
    expect(loadError).not.toBeInTheDocument();
  });

  it("shows the empty placeholder when loaded with no messages", () => {
    setup({ messagesStatus: MessagesStatus.Loaded });

    const emptyMessage = queryEmptyMessage();
    const loader = queryLoader();

    expect(emptyMessage).toBeInTheDocument();
    expect(loader).not.toBeInTheDocument();
  });

  it("shows the message list when loaded with messages", () => {
    stubVirtualizerLayout();

    setup({
      messages: chatMessageFixtures,
      messagesStatus: MessagesStatus.Loaded,
    });

    const list = queryList();
    const emptyMessage = queryEmptyMessage();

    expect(list).toBeInTheDocument();
    expect(emptyMessage).not.toBeInTheDocument();
  });

  it("shows the load error without the loader when loading failed", () => {
    setup({ messagesStatus: MessagesStatus.Error });

    const loadError = queryLoadError();
    const loader = queryLoader();

    expect(loadError).toBeInTheDocument();
    expect(loader).not.toBeInTheDocument();
  });

  it("calls onRetry when try again is clicked after a load error", async () => {
    const { user, onRetry } = setup({ messagesStatus: MessagesStatus.Error });

    const tryAgainButton = getTryAgainButton();

    await user.click(tryAgainButton);

    expect(onRetry).toHaveBeenCalledOnce();
  });
});

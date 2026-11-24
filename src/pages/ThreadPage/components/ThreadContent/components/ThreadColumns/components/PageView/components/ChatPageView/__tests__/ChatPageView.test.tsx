import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addComposerTag,
  chatMessageFixtures,
  createDeferred,
  createServicesMock,
  failPageMessageAdd,
  failPageMessagesLoad,
  firstPageMessageFixtures,
  getComposerEditor,
  getFeedMessageContents,
  getFeedMessages,
  getSendButton,
  getTryAgainButton,
  isFollowing,
  LOAD_MESSAGES_ERROR,
  mindThreadFixtures,
  readStoredMessages,
  resetThreadsServiceOverrides,
  sectionPageFixtures,
  seedMessages,
  seedPages,
  seedSections,
  seedThreads,
  sendComposerMessage,
  stubVirtualizerLayout,
  threadSectionFixtures,
  threadsServiceOverrides,
  typeInComposer,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import type { ChatMessage } from "@/types";
import { MessageComposerTestId } from "../components/MessageComposer/MessageComposer.constants";
import {
  MessageFeedTestId,
  EMPTY_FEED_MESSAGE,
  LOADING_MESSAGES_LABEL,
} from "../components/MessageFeed/MessageFeed.constants";
import {
  MessagesLoadErrorTestId,
  TRY_AGAIN_LABEL,
} from "../components/MessageFeed/components/MessagesLoadError/MessagesLoadError.constants";
import { TagChipTestId } from "../components/TagChip/TagChip.constants";
import {
  ChatPageViewTestId,
  SEND_MESSAGE_ERROR_MESSAGE,
} from "../ChatPageView.constants";
import { ChatPageView } from "../ChatPageView";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const THREAD_ID = mindThreadFixtures[0].id;
const PAGE = sectionPageFixtures[0];
const MESSAGE_TEXT = "Hello";
const DRAFT_TEXT = "Draft";
const TAG = "ideas";

type SetupParams = {
  messages?: ChatMessage[];
};

const setup = ({ messages = chatMessageFixtures }: SetupParams = {}) => {
  const user = userEvent.setup();

  seedThreads(mindThreadFixtures);
  seedSections(threadSectionFixtures);
  seedPages(sectionPageFixtures);
  seedMessages(messages);

  renderWithUIProvider(
    <ThreadPageLoader threadId={THREAD_ID}>
      <ChatPageView page={PAGE} />
    </ThreadPageLoader>
  );

  return { user };
};

const getChatView = () => {
  return screen.getByTestId(ChatPageViewTestId.container);
};

const getFeedContainer = () => {
  return screen.getByTestId(MessageFeedTestId.container);
};

const getComposerContainer = () => {
  return within(getChatView()).getByTestId(MessageComposerTestId.container);
};

const getLoader = () => {
  return screen.getByRole("status", { name: LOADING_MESSAGES_LABEL });
};

const getComposerChipNames = () => {
  const composer = getComposerContainer();

  return within(composer)
    .queryAllByTestId(TagChipTestId.name)
    .map((chipName) => {
      return chipName.textContent;
    });
};

const waitForFeedMessageCount = async (count: number) => {
  await waitFor(() => {
    expect(getFeedMessages()).toHaveLength(count);
  });
};

beforeEach(() => {
  stubVirtualizerLayout();
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("ChatPageView", () => {
  it("places the feed below the composer", async () => {
    setup();

    await waitForFeedMessageCount(firstPageMessageFixtures.length);

    const composer = getComposerContainer();
    const feed = getFeedContainer();

    expect(isFollowing({ element: feed, previousElement: composer })).toBe(
      true
    );
  });

  it("shows the placeholder when the page has no messages", async () => {
    setup({ messages: [] });

    const placeholder = await screen.findByText(EMPTY_FEED_MESSAGE);
    expect(placeholder).toBeInTheDocument();
  });

  it("adds a sent message at the top of the feed, clears the editor and shows no notification", async () => {
    const { user } = setup();

    await waitForFeedMessageCount(firstPageMessageFixtures.length);
    await sendComposerMessage({ user, text: MESSAGE_TEXT });
    await waitForFeedMessageCount(firstPageMessageFixtures.length + 1);

    const [newestContent] = getFeedMessageContents();
    const editor = getComposerEditor();

    await waitFor(() => {
      expect(editor.textContent).toBe("");
    });

    expect(newestContent).toBe(MESSAGE_TEXT);
    expect(readStoredMessages()[0].content).toBe("<p>Hello</p>");

    const notification = screen.queryByTestId(NotificationsTestId.notification);
    expect(notification).not.toBeInTheDocument();
  });

  it("shows the loader while the messages are pending and removes it once they load", async () => {
    const pendingMessages = createDeferred<ChatMessage[]>();

    threadsServiceOverrides.getPageMessages = () => {
      return pendingMessages.promise;
    };

    setup();

    const loader = getLoader();

    pendingMessages.resolve(firstPageMessageFixtures);

    await waitForElementToBeRemoved(loader);

    expect(getFeedMessages()).toHaveLength(firstPageMessageFixtures.length);
  });

  it("shows the load error with try again when loading fails", async () => {
    failPageMessagesLoad();

    setup();

    const loader = getLoader();
    await waitForElementToBeRemoved(loader);

    const tryAgainButton = await screen.findByRole("button", {
      name: TRY_AGAIN_LABEL,
    });

    const loadError = screen.getByTestId(MessagesLoadErrorTestId.container);

    expect(tryAgainButton).toBeInTheDocument();
    expect(tryAgainButton).toBeEnabled();

    expect(loadError).toBeInTheDocument();
  });

  it("shows the loader again on try again, then the messages after a successful load", async () => {
    const retryMessages = createDeferred<ChatMessage[]>();

    failPageMessagesLoad();

    const { user } = setup();

    const initialLoader = getLoader();
    await waitForElementToBeRemoved(initialLoader);

    threadsServiceOverrides.getPageMessages = () => {
      return retryMessages.promise;
    };

    const tryAgainButton = getTryAgainButton();
    await user.click(tryAgainButton);

    const retryLoader = getLoader();

    retryMessages.resolve(firstPageMessageFixtures);

    await waitForElementToBeRemoved(retryLoader);
    await waitForFeedMessageCount(firstPageMessageFixtures.length);
  });

  it("keeps the typed text and tag when another try again fails", async () => {
    const retryFailure = createDeferred<ChatMessage[]>();

    failPageMessagesLoad();

    const { user } = setup();

    const initialLoader = getLoader();
    await waitForElementToBeRemoved(initialLoader);

    await typeInComposer({ user, text: DRAFT_TEXT });
    await addComposerTag({ user, tag: TAG });

    threadsServiceOverrides.getPageMessages = () => {
      return retryFailure.promise;
    };

    const tryAgainButton = getTryAgainButton();
    await user.click(tryAgainButton);

    const retryLoader = getLoader();

    retryFailure.reject(new Error(LOAD_MESSAGES_ERROR));

    await waitForElementToBeRemoved(retryLoader);

    const editor = getComposerEditor();

    const failedRetryButton = await screen.findByRole("button", {
      name: TRY_AGAIN_LABEL,
    });

    expect(failedRetryButton).toBeInTheDocument();
    expect(editor.textContent).toBe(DRAFT_TEXT);
    expect(getComposerChipNames()).toStrictEqual([TAG]);
  });

  it("adds no message, shows the send error and keeps the text and tag when addPageMessage rejects", async () => {
    failPageMessageAdd();

    const { user } = setup();

    await waitForFeedMessageCount(firstPageMessageFixtures.length);

    await typeInComposer({ user, text: DRAFT_TEXT });
    await addComposerTag({ user, tag: TAG });

    const sendButton = getSendButton();
    await user.click(sendButton);

    const errorNotification = await screen.findByText(
      SEND_MESSAGE_ERROR_MESSAGE
    );

    const editor = getComposerEditor();

    expect(errorNotification).toBeInTheDocument();
    expect(getFeedMessages()).toHaveLength(firstPageMessageFixtures.length);
    expect(editor.textContent).toBe(DRAFT_TEXT);
    expect(getComposerChipNames()).toStrictEqual([TAG]);
  });
});

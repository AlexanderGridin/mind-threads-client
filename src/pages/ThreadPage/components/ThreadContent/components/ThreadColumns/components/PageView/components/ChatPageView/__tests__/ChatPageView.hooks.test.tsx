import type { ReactNode } from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import {
  chatMessageFixtures,
  createServicesMock,
  failPageMessageAdd,
  failPageMessagesLoad,
  firstPageMessageFixtures,
  mindThreadFixtures,
  readStoredMessages,
  resetThreadsServiceOverrides,
  sectionPageFixtures,
  seedMessages,
  seedPages,
  seedSections,
  seedThreads,
  threadSectionFixtures,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import { ChakraUIProvider } from "@/components/lib/ChakraUIProvider";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import {
  MessagesStatus,
  SEND_MESSAGE_ERROR_MESSAGE,
} from "../ChatPageView.constants";
import { usePageMessages } from "../ChatPageView.hooks";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const THREAD_ID = mindThreadFixtures[0].id;
const PAGE = sectionPageFixtures[0];
const NEW_MESSAGE = { content: "<p>Hi</p>", tags: [] };

type HookWrapperProps = {
  children: ReactNode;
};

const HookWrapper = ({ children }: HookWrapperProps) => {
  return (
    <ChakraUIProvider>
      <ThreadPageLoader threadId={THREAD_ID}>{children}</ThreadPageLoader>
    </ChakraUIProvider>
  );
};

const setupHook = () => {
  seedThreads(mindThreadFixtures);
  seedSections(threadSectionFixtures);
  seedPages(sectionPageFixtures);
  seedMessages(chatMessageFixtures);

  return renderHook(() => usePageMessages(PAGE), { wrapper: HookWrapper });
};

const waitForLoadedMessages = async (
  result: ReturnType<typeof setupHook>["result"]
) => {
  await waitFor(() => {
    expect(result.current.messagesStatus).toBe(MessagesStatus.Loaded);
  });
};

describe("usePageMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetThreadsServiceOverrides();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetThreadsServiceOverrides();
  });

  it("starts loading and then becomes loaded with the page's messages", async () => {
    const { result } = setupHook();

    expect(result.current.messagesStatus).toBe(MessagesStatus.Loading);

    await waitForLoadedMessages(result);

    expect(result.current.messages).toStrictEqual(firstPageMessageFixtures);
  });

  it("becomes an error when getPageMessages rejects", async () => {
    failPageMessagesLoad();

    const { result } = setupHook();

    await waitFor(() => {
      expect(result.current.messagesStatus).toBe(MessagesStatus.Error);
    });
  });

  it("retryLoadingMessages goes back to loading and loads the messages after a fixed override", async () => {
    failPageMessagesLoad();

    const { result } = setupHook();

    await waitFor(() => {
      expect(result.current.messagesStatus).toBe(MessagesStatus.Error);
    });

    threadsServiceOverrides.getPageMessages = async () => {
      return firstPageMessageFixtures;
    };

    act(() => {
      result.current.retryLoadingMessages();
    });

    expect(result.current.messagesStatus).toBe(MessagesStatus.Loading);

    await waitForLoadedMessages(result);

    expect(result.current.messages).toStrictEqual(firstPageMessageFixtures);
  });

  it("sendMessage resolves true, prepends the created message and shows no notification", async () => {
    const { result } = setupHook();

    await waitForLoadedMessages(result);

    let isSent = false;

    await act(async () => {
      isSent = await result.current.sendMessage(NEW_MESSAGE);
    });

    const [createdMessage] = readStoredMessages();

    expect(isSent).toBe(true);
    expect(result.current.messages).toStrictEqual([
      createdMessage,
      ...firstPageMessageFixtures,
    ]);

    const notification = screen.queryByTestId(NotificationsTestId.notification);
    expect(notification).not.toBeInTheDocument();
  });

  it("sendMessage resolves false, keeps the messages and shows the error when addPageMessage rejects", async () => {
    failPageMessageAdd();

    const { result } = setupHook();

    await waitForLoadedMessages(result);

    let isSent = true;

    await act(async () => {
      isSent = await result.current.sendMessage(NEW_MESSAGE);
    });

    expect(isSent).toBe(false);
    expect(result.current.messages).toStrictEqual(firstPageMessageFixtures);

    const errorNotification = await screen.findByText(
      SEND_MESSAGE_ERROR_MESSAGE
    );

    expect(errorNotification).toBeInTheDocument();
  });
});

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { notify } from "@/components/lib";
import {
  MALFORMED_JSON,
  createDeferred,
  createServicesMock,
  mindThreadFixtures,
  mindThreadFixturesWithSameTitle,
  renderWithRouter,
  resetThreadsServiceOverrides,
  seedThreads,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import { getThreadPath } from "@/routing/routing.utils";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import type { MindThread } from "@/types";
import { ThreadPage } from "../ThreadPage";
import {
  BACK_TO_DASHBOARD_LABEL,
  LOADING_THREAD_LABEL,
  ThreadPageTestId,
  THREAD_LOAD_ERROR_MESSAGE,
  THREAD_NOT_FOUND_MESSAGE,
} from "../ThreadPage.constants";
import { ThreadColumnsTestId } from "../components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { ThreadHeaderTestId } from "../components/ThreadHeader/ThreadHeader.constants";
import { APP_NAME } from "@/components/shared";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const DASHBOARD_TITLE = "Dashboard title";
const APP_TITLE = "Mind Threads";
const THREAD_TITLE = "Testing Strategy";
const THREAD_COLOR = "#A8E6CF";
const THREAD_ID = "same-title-1";
const UNKNOWN_THREAD_ID = "unknown-thread-id";
const STORED_THREAD = mindThreadFixturesWithSameTitle[0];
const STORED_BOOKMARK_THREAD = mindThreadFixtures[1];

type SetupParams = {
  threadId: string;
};

const setup = ({ threadId }: SetupParams) => {
  const user = userEvent.setup();

  const renderResult = renderWithRouter({
    ui: <ThreadPage />,
    path: AppPath.Thread,
    initialPath: getThreadPath(threadId),
  });

  return { user, unmount: renderResult.unmount };
};

beforeEach(() => {
  document.title = DASHBOARD_TITLE;
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("ThreadPage", () => {
  it("shows the loader, an empty header and the app title while the thread is pending", () => {
    threadsServiceOverrides.getThread = () =>
      createDeferred<MindThread | null>().promise;

    setup({ threadId: THREAD_ID });

    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });
    const headerTitle = screen.queryByTestId(ThreadHeaderTestId.title);

    expect(loader).toBeInTheDocument();
    expect(headerTitle).not.toBeInTheDocument();
    expect(document.title).toBe(APP_TITLE);
  });

  it("removes the loader and shows the thread once the stored thread is loaded", async () => {
    const pendingThread = createDeferred<MindThread | null>();
    threadsServiceOverrides.getThread = () => pendingThread.promise;

    setup({ threadId: THREAD_ID });

    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });
    expect(loader).toBeInTheDocument();

    pendingThread.resolve(STORED_THREAD);

    await waitForElementToBeRemoved(loader);

    const header = screen.getByTestId(ThreadHeaderTestId.container);
    const headerTitle = screen.getByTestId(ThreadHeaderTestId.title);
    const columns = screen.getByTestId(ThreadColumnsTestId.container);

    expect(headerTitle.textContent).toBe(THREAD_TITLE);
    expect(header).toHaveStyle({ backgroundColor: THREAD_COLOR });
    expect(columns).toBeInTheDocument();
    expect(document.title).toBe(`${THREAD_TITLE} · ${APP_TITLE}`);
  });

  it("shows the thread opened directly by its address, again after a remount", async () => {
    seedThreads(mindThreadFixtures);

    const { unmount } = setup({ threadId: STORED_BOOKMARK_THREAD.id });

    const firstHeaderTitle = await screen.findByTestId(
      ThreadHeaderTestId.title
    );
    expect(firstHeaderTitle.textContent).toBe(STORED_BOOKMARK_THREAD.title);

    unmount();

    setup({ threadId: STORED_BOOKMARK_THREAD.id });

    const secondHeaderTitle = await screen.findByTestId(
      ThreadHeaderTestId.title
    );

    expect(secondHeaderTitle.textContent).toBe(STORED_BOOKMARK_THREAD.title);
  });

  it("gives the page a minimum width of 768px", () => {
    setup({ threadId: THREAD_ID });

    const page = screen.getByTestId(ThreadPageTestId.container);
    expect(page).toHaveStyle({ minWidth: "768px" });
  });

  it("shows the not-found message and no notification for a thread that does not exist", async () => {
    const errorSpy = vi.spyOn(notify, "error");
    const successSpy = vi.spyOn(notify, "success");

    seedThreads(mindThreadFixtures);

    setup({ threadId: UNKNOWN_THREAD_ID });

    const notFoundMessage = await screen.findByText(THREAD_NOT_FOUND_MESSAGE);
    const main = screen.getByRole("main");
    const backButton = within(main).getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    const columns = screen.queryByTestId(ThreadColumnsTestId.container);
    const headerTitle = screen.queryByTestId(ThreadHeaderTestId.title);
    const header = screen.getByTestId(ThreadHeaderTestId.container);

    expect(notFoundMessage).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();

    expect(columns).not.toBeInTheDocument();
    expect(headerTitle).not.toBeInTheDocument();

    expect(header.style.backgroundColor).toBe("");
    expect(document.title).toBe(`Thread not found · ${APP_TITLE}`);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("shows the load error and no notification when the saved data can't be read", async () => {
    const errorSpy = vi.spyOn(notify, "error");
    const successSpy = vi.spyOn(notify, "success");
    vi.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

    setup({ threadId: THREAD_ID });

    const loadErrorMessage = await screen.findByText(THREAD_LOAD_ERROR_MESSAGE);
    const main = screen.getByRole("main");
    const backButton = within(main).getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    const headerTitle = screen.queryByTestId(ThreadHeaderTestId.title);
    const header = screen.getByTestId(ThreadHeaderTestId.container);

    expect(loadErrorMessage).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();

    expect(headerTitle).not.toBeInTheDocument();
    expect(header.style.backgroundColor).toBe("");

    expect(document.title).toBe(APP_TITLE);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("restores the dashboard title after the page is unmounted", async () => {
    seedThreads(mindThreadFixtures);

    const { unmount } = setup({ threadId: STORED_BOOKMARK_THREAD.id });

    const header = await screen.findByTestId(ThreadHeaderTestId.title);
    expect(header).toBeInTheDocument();

    expect(document.title).toBe(
      `${STORED_BOOKMARK_THREAD.title} · ${APP_NAME}`
    );

    unmount();

    expect(document.title).toBe(DASHBOARD_TITLE);
  });
});

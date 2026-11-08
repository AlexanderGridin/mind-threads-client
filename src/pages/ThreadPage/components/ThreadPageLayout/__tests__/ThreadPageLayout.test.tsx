import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import {
  createDeferred,
  createServicesMock,
  mindThreadFixtures,
  renderWithRouter,
  resetThreadsServiceOverrides,
  seedThreads,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import { getThreadPath } from "@/routing/routing.utils";
import type { MindThread } from "@/types";
import {
  LOADING_THREAD_LABEL,
  THREAD_NOT_FOUND_MESSAGE,
} from "@/pages/ThreadPage/ThreadPage.constants";
import { ThreadColumnsTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { ThreadHeaderTestId } from "@/pages/ThreadPage/components/ThreadHeader/ThreadHeader.constants";
import { ThreadPageLoader } from "../../ThreadPageLoader";
import { ThreadPageLayout } from "../ThreadPageLayout";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD = mindThreadFixtures[0];
const UNKNOWN_THREAD_ID = "unknown-thread-id";

type SetupParams = {
  threadId: string;
};

const setup = ({ threadId }: SetupParams) => {
  renderWithRouter({
    ui: (
      <ThreadPageLoader threadId={threadId}>
        <ThreadPageLayout />
      </ThreadPageLoader>
    ),
    path: AppPath.Thread,
    initialPath: getThreadPath(threadId),
  });
};

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("ThreadPageLayout", () => {
  it("shows the loader while the thread is loading", () => {
    threadsServiceOverrides.getThread = () => {
      return createDeferred<MindThread | null>().promise;
    };

    setup({ threadId: STORED_THREAD.id });

    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });
    expect(loader).toBeInTheDocument();
  });

  it("removes the loader and shows the columns for a stored thread", async () => {
    seedThreads(mindThreadFixtures);

    setup({ threadId: STORED_THREAD.id });

    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });
    await waitForElementToBeRemoved(loader);

    const headerTitle = screen.getByTestId(ThreadHeaderTestId.title);
    const columns = screen.getByTestId(ThreadColumnsTestId.container);

    expect(headerTitle.textContent).toBe(STORED_THREAD.title);
    expect(columns).toBeInTheDocument();
  });

  it("shows the not-found message for an unknown thread id", async () => {
    seedThreads(mindThreadFixtures);

    setup({ threadId: UNKNOWN_THREAD_ID });

    const notFoundMessage = await screen.findByText(THREAD_NOT_FOUND_MESSAGE);
    expect(notFoundMessage).toBeInTheDocument();
  });
});

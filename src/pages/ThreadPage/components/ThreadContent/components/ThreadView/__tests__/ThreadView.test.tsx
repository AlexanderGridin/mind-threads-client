import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import {
  mindThreadFixtures,
  renderWithRouter,
  seedThreads,
} from "@/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import {
  ThreadStatus,
  THREAD_LOAD_ERROR_MESSAGE,
  THREAD_NOT_FOUND_MESSAGE,
} from "@/pages/ThreadPage/ThreadPage.constants";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { ThreadView } from "../ThreadView";
import { ThreadColumnsTestId } from "../../ThreadColumns/ThreadColumns.constants";
import { ThreadMessageTestId } from "../../ThreadMessage/ThreadMessage.constants";

const THREAD_PATH = "/threads/test-thread";
const STORED_THREAD = mindThreadFixtures[0];

const setup = (threadStatus: ThreadStatusType) => {
  renderWithRouter({
    ui: (
      <ThreadPageLoader threadId={STORED_THREAD.id}>
        <ThreadView threadStatus={threadStatus} />
      </ThreadPageLoader>
    ),
    path: AppPath.Thread,
    initialPath: THREAD_PATH,
  });
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
});

describe("ThreadView", () => {
  it.each([
    {
      threadStatus: ThreadStatus.Loading,
      hasColumns: false,
      hasMessage: false,
    },
    {
      threadStatus: ThreadStatus.Loaded,
      hasColumns: true,
      hasMessage: false,
    },
    {
      threadStatus: ThreadStatus.NotFound,
      hasColumns: false,
      hasMessage: true,
    },
    {
      threadStatus: ThreadStatus.Error,
      hasColumns: false,
      hasMessage: true,
    },
  ])(
    "renders the expected content for the $threadStatus status",
    ({ threadStatus, hasColumns, hasMessage }) => {
      setup(threadStatus);

      const columns = screen.queryByTestId(ThreadColumnsTestId.container);
      const message = screen.queryByTestId(ThreadMessageTestId.container);

      expect(Boolean(columns)).toBe(hasColumns);
      expect(Boolean(message)).toBe(hasMessage);
    }
  );

  it("shows the not-found message for a thread that does not exist", () => {
    setup(ThreadStatus.NotFound);

    const notFoundMessage = screen.getByText(THREAD_NOT_FOUND_MESSAGE);
    expect(notFoundMessage).toBeInTheDocument();
  });

  it("shows the load error message when the saved data can't be read", () => {
    setup(ThreadStatus.Error);

    const loadErrorMessage = screen.getByText(THREAD_LOAD_ERROR_MESSAGE);
    expect(loadErrorMessage).toBeInTheDocument();
  });
});

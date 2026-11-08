import { describe, it, expect, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  mindThreadFixtures,
  renderWithRouter,
  seedThreads,
} from "@/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import {
  ThreadStatus,
  THREAD_NOT_FOUND_MESSAGE,
} from "@/pages/ThreadPage/ThreadPage.constants";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { ThreadContent } from "../ThreadContent";
import { ThreadColumnsTestId } from "../components/ThreadColumns/ThreadColumns.constants";

const THREAD_PATH = "/threads/test-thread";
const STORED_THREAD = mindThreadFixtures[0];

const setup = (threadStatus: ThreadStatusType) => {
  renderWithRouter({
    ui: (
      <ThreadPageLoader threadId={STORED_THREAD.id}>
        <ThreadContent threadStatus={threadStatus} />
      </ThreadPageLoader>
    ),
    path: AppPath.Thread,
    initialPath: THREAD_PATH,
  });
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
});

describe("ThreadContent", () => {
  it("renders a main landmark that contains the columns once the thread is loaded", () => {
    setup(ThreadStatus.Loaded);

    const main = screen.getByRole("main");
    const columns = within(main).getByTestId(ThreadColumnsTestId.container);

    expect(main).toBeInTheDocument();
    expect(columns).toBeInTheDocument();
  });

  it("renders the not-found message inside the main landmark", () => {
    setup(ThreadStatus.NotFound);

    const main = screen.getByRole("main");
    const notFoundMessage = within(main).getByText(THREAD_NOT_FOUND_MESSAGE);

    expect(notFoundMessage).toBeInTheDocument();
  });
});

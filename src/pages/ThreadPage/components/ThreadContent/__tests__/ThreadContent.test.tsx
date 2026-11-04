import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithRouter } from "@/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import {
  ThreadStatus,
  THREAD_NOT_FOUND_MESSAGE,
} from "@/pages/ThreadPage/ThreadPage.constants";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import { ThreadContent } from "../ThreadContent";
import { ThreadColumnsTestId } from "../components/ThreadColumns/ThreadColumns.constants";

const THREAD_PATH = "/threads/test-thread";

const setup = (threadStatus: ThreadStatusType) => {
  renderWithRouter({
    ui: <ThreadContent threadStatus={threadStatus} />,
    path: AppPath.Thread,
    initialPath: THREAD_PATH,
  });
};

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

import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  MALFORMED_JSON,
  mindThreadFixtures,
  renderWithRouter,
  seedThreads,
} from "@/__test-fixtures__";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { DashboardPageLoader } from "@/pages/DashboardPage/components/DashboardPageLoader";
import { EmptyThreadListTestId } from "../../EmptyThreadList/EmptyThreadList.constants";
import { MindThreadListTestId } from "../../MindThreadList/MindThreadList.constants";
import { ThreadsLoadErrorTestId } from "../../ThreadsLoadError/ThreadsLoadError.constants";
import { ThreadsSection } from "../ThreadsSection";

const setup = () => {
  renderWithRouter({
    ui: (
      <DashboardPageLoader>
        <ThreadsSection />
      </DashboardPageLoader>
    ),
  });
};

describe("ThreadsSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the empty state when no threads are stored", async () => {
    setup();

    const emptyStateContainer = await screen.findByTestId(
      EmptyThreadListTestId.container
    );

    expect(emptyStateContainer).toBeInTheDocument();

    const threadsListContainer = screen.queryByTestId(
      MindThreadListTestId.container
    );

    expect(threadsListContainer).not.toBeInTheDocument();
  });

  it("shows the thread list when threads are stored", async () => {
    seedThreads(mindThreadFixtures);

    setup();

    const threadsListContainer = await screen.findByTestId(
      MindThreadListTestId.container
    );

    expect(threadsListContainer).toBeInTheDocument();

    const listItems = screen.getAllByTestId(MindThreadListTestId.listItem);
    expect(listItems).toHaveLength(mindThreadFixtures.length);

    const emptyStateContainer = screen.queryByTestId(
      EmptyThreadListTestId.container
    );

    expect(emptyStateContainer).not.toBeInTheDocument();
  });

  it("shows the error card without the empty state or a notification when the stored threads are malformed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

    setup();

    const threadsLoadError = await screen.findByTestId(
      ThreadsLoadErrorTestId.container
    );

    expect(threadsLoadError).toBeInTheDocument();

    const threadsListContainer = screen.queryByTestId(
      MindThreadListTestId.container
    );

    expect(threadsListContainer).not.toBeInTheDocument();

    const emptyThreadList = screen.queryByTestId(
      EmptyThreadListTestId.container
    );

    expect(emptyThreadList).not.toBeInTheDocument();

    const notification = screen.queryByTestId(NotificationsTestId.notification);
    expect(notification).not.toBeInTheDocument();
  });
});

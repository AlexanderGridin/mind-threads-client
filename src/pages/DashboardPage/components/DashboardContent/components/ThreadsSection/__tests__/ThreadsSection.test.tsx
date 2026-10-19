import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  MALFORMED_JSON,
  mindThreadFixtures,
  seedThreads,
} from "@/__test-fixtures__";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { DashboardPageLoader } from "@/pages/DashboardPage/components/DashboardPageLoader";
import { EmptyThreadListTestId } from "../../EmptyThreadList/EmptyThreadList.constants";
import { MindThreadListTestId } from "../../MindThreadList/MindThreadList.constants";
import { ThreadsLoadErrorTestId } from "../../ThreadsLoadError/ThreadsLoadError.constants";
import { ThreadsSection } from "../ThreadsSection";

const setup = () => {
  renderWithUIProvider(
    <DashboardPageLoader>
      <ThreadsSection />
    </DashboardPageLoader>
  );
};

describe("ThreadsSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the empty state when no threads are stored", async () => {
    setup();

    expect(
      await screen.findByTestId(EmptyThreadListTestId.container)
    ).toBeInTheDocument();
  });

  it("shows the thread list when threads are stored", async () => {
    seedThreads(mindThreadFixtures);

    setup();

    expect(
      await screen.findByTestId(MindThreadListTestId.container)
    ).toBeInTheDocument();

    expect(screen.getAllByTestId(MindThreadListTestId.listItem)).toHaveLength(
      mindThreadFixtures.length
    );
  });

  it("shows the error card without the empty state or a notification when the stored threads are malformed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

    setup();

    expect(
      await screen.findByTestId(ThreadsLoadErrorTestId.container)
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId(EmptyThreadListTestId.container)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(NotificationsTestId.notification)
    ).not.toBeInTheDocument();
  });
});

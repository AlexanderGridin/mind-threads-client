import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { ThreadListModeButton } from "../ThreadListModeButton";
import { ThreadListModeButtonTestId } from "../ThreadListModeButton.constants";

let mockThreadListMode: ThreadListModeType = ThreadListMode.Grid;
const mockToggleThreadListMode = vi.fn();

vi.mock("../../../../DashboardPageLoader/DashboardPageLoader.hooks", () => ({
  useDashboardPageValue: () => ({
    threadListMode: mockThreadListMode,
    threads: [],
  }),
  useDashboardPageAction: () => ({
    toggleThreadListMode: mockToggleThreadListMode,
  }),
}));

const setup = () => {
  const user = userEvent.setup();
  renderWithUIProvider(<ThreadListModeButton />);
  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
  mockThreadListMode = ThreadListMode.Grid;
});

describe("ThreadListModeButton", () => {
  it("renders properly", () => {
    setup();

    const button = screen.getByTestId(ThreadListModeButtonTestId.container);

    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName("Toggle thread list mode");
  });

  it("should call toggleThreadListMode when clicked", async () => {
    const { user } = setup();

    const button = screen.getByTestId(ThreadListModeButtonTestId.container);
    await user.click(button);

    expect(mockToggleThreadListMode).toHaveBeenCalledOnce();
  });

  it("shows grid icon when mode is grid", () => {
    setup();

    const gridIcon = screen.getByTestId(ThreadListModeButtonTestId.gridIcon);
    expect(gridIcon).toBeInTheDocument();
  });

  it("shows list icon when mode is list", () => {
    mockThreadListMode = ThreadListMode.List;

    setup();

    const listIcon = screen.getByTestId(ThreadListModeButtonTestId.listIcon);
    expect(listIcon).toBeInTheDocument();
  });
});

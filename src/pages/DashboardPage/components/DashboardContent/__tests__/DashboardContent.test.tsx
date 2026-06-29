import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { DashboardContent } from "../DashboardContent";
import { DashboardContentTestId } from "../DashboardContent.constants";
import { MindThreadListTestId } from "../components/MindThreadList/MindThreadList.constants";
import { mindThreadFixturesWithSingleItem } from "@/__test-fixtures__";

vi.mock(
  "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks",
  () => ({
    useDashboardPageValue: () => ({
      threads: mindThreadFixturesWithSingleItem,
      threadListMode: ThreadListMode.Grid,
    }),
    useDashboardPageAction: () => ({
      toggleThreadListMode: vi.fn(),
    }),
  })
);

const setup = () => {
  renderWithUIProvider(<DashboardContent />);
};

describe("DashboardContent", () => {
  it("renders properly", () => {
    setup();

    const mainContainer = screen.getByTestId(DashboardContentTestId.container);

    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer.tagName).toBe("MAIN");

    expect(
      screen.getByTestId(MindThreadListTestId.container)
    ).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import {
  mindThreadFixturesWithSingleItem,
  seedThreads,
} from "@/__test-fixtures__";
import { DashboardPageLoader } from "@/pages/DashboardPage/components/DashboardPageLoader";
import { DashboardContent } from "../DashboardContent";
import { DashboardContentTestId } from "../DashboardContent.constants";
import { MindThreadListTestId } from "../components/MindThreadList/MindThreadList.constants";

const setup = () => {
  renderWithUIProvider(
    <DashboardPageLoader>
      <DashboardContent />
    </DashboardPageLoader>
  );
};

describe("DashboardContent", () => {
  it("renders the main container with the thread list for stored threads", async () => {
    seedThreads(mindThreadFixturesWithSingleItem);

    setup();

    const mainContainer = screen.getByTestId(DashboardContentTestId.container);

    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer.tagName).toBe("MAIN");

    const threadsList = await within(mainContainer).findByTestId(
      MindThreadListTestId.container
    );

    expect(threadsList).toBeInTheDocument();
  });
});

import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { DashboardPage } from "../DashboardPage";
import { DashboardHeaderTestId } from "../components/DashboardHeader/DashboardHeader.constants";
import { DashboardContentTestId } from "../components/DashboardContent/DashboardContent.constants";
import { mindThreadFixturesWithSingleItem } from "@/__test-fixtures__";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

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
  renderWithUIProvider(<DashboardPage />);
};

describe("DashboardPage", () => {
  it("renders properly", () => {
    setup();

    expect(
      screen.getByTestId(DashboardHeaderTestId.container)
    ).toBeInTheDocument();
  });

  it("renders DashboardContent", () => {
    setup();

    expect(
      screen.getByTestId(DashboardContentTestId.container)
    ).toBeInTheDocument();
  });
});

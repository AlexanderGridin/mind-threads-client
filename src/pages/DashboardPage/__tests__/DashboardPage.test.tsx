import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { DashboardPage } from "../DashboardPage";
import { DashboardHeaderTestId } from "../components/DashboardHeader/DashboardHeader.constants";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

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
});

import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { DashboardHeader } from "../DashboardHeader";
import { DashboardHeaderTestId } from "../DashboardHeader.constants";
import { ColorModeButtonTestId } from "@/components/lib/color-mode/components/ColorModeButton/ColorModeButton.constants";
import { AppLogoTestId } from "../components";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  renderWithUIProvider(<DashboardHeader />);
};

describe("DashboardHeader", () => {
  it("renders properly", () => {
    setup();

    expect(
      screen.getByTestId(DashboardHeaderTestId.container)
    ).toBeInTheDocument();

    expect(screen.getByTestId(AppLogoTestId.container)).toBeInTheDocument();

    expect(
      screen.getByTestId(ColorModeButtonTestId.container)
    ).toBeInTheDocument();
  });
});

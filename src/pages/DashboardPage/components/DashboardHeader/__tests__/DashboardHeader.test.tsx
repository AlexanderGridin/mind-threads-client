import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { DashboardHeader } from "../DashboardHeader";
import { DashboardHeaderTestId } from "../DashboardHeader.constants";
import { ColorModeButtonTestId } from "@/components/lib/color-mode/components/ColorModeButton/ColorModeButton.constants";
import { AppLogoTestId } from "@/components/shared";
import { AddNewThreadTestId } from "../components";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

vi.mock(
  "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks",
  () => ({
    useDashboardPageValue: () => ({
      threads: [],
      threadListMode: ThreadListMode.Grid,
    }),
    useDashboardPageAction: () => ({
      toggleThreadListMode: vi.fn(),
    }),
  })
);

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
      screen.getByTestId(AddNewThreadTestId.openModalButton)
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(ColorModeButtonTestId.container)
    ).toBeInTheDocument();
  });
});

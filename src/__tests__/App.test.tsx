import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { renderWithUIProvider } from "@/components/lib";
import { App } from "../App";
import { DashboardHeaderTestId } from "@/pages/DashboardPage/components/DashboardHeader/DashboardHeader.constants";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = (initialPath: string = "/") => {
  renderWithUIProvider(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
};

describe("App", () => {
  it("renders DashboardPage at the root path", () => {
    setup("/");

    expect(
      screen.getByTestId(DashboardHeaderTestId.container)
    ).toBeInTheDocument();
  });

  it("renders ThreadPage at /threads/:threadId", () => {
    setup("/threads/42");

    expect(
      screen.getByRole("heading", { name: "ThreadPage" })
    ).toBeInTheDocument();
  });
});

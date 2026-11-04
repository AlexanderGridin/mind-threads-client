import { describe, it, expect, afterEach } from "vitest";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithUIProvider } from "@/components/lib";
import { ColorModeButtonTestId } from "@/components/lib/color-mode/components/ColorModeButton/ColorModeButton.constants";
import { mindThreadFixtures, seedThreads } from "@/__test-fixtures__";
import { App } from "../App";
import { DashboardHeaderTestId } from "@/pages/DashboardPage/components/DashboardHeader/DashboardHeader.constants";
import {
  BACK_TO_DASHBOARD_LABEL,
  LOADING_THREAD_LABEL,
} from "@/pages/ThreadPage/ThreadPage.constants";
import { getThreadPath } from "@/routing/routing.utils";

const COLOR_MODE_STORAGE_KEY = "theme";
const DARK_CLASS_NAME = "dark";
const STORED_THREAD = mindThreadFixtures[1];

const setup = (initialPath: string) => {
  const user = userEvent.setup();

  const router = createMemoryRouter([{ path: "*", element: <App /> }], {
    initialEntries: [initialPath],
  });

  renderWithUIProvider(<RouterProvider router={router} />);

  return { user };
};

afterEach(() => {
  document.documentElement.classList.remove(DARK_CLASS_NAME, "light");
});

describe("App color mode", () => {
  it("keeps the dark color mode chosen on a thread page on the dashboard", async () => {
    seedThreads(mindThreadFixtures);

    const { user } = setup(getThreadPath(STORED_THREAD.id));
    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });

    await waitForElementToBeRemoved(loader);

    expect(document.documentElement).not.toHaveClass(DARK_CLASS_NAME);

    const colorModeToggle = screen.getByTestId(ColorModeButtonTestId.container);
    await user.click(colorModeToggle);

    expect(document.documentElement).toHaveClass(DARK_CLASS_NAME);

    const backButton = await screen.findByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    await user.click(backButton);

    const dashboardHeader = await screen.findByTestId(
      DashboardHeaderTestId.container
    );

    expect(dashboardHeader).toBeInTheDocument();
    expect(document.documentElement).toHaveClass(DARK_CLASS_NAME);

    const storedColorMode = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    expect(storedColorMode).toBe("dark");
  });
});

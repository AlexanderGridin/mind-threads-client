import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  isFollowing,
  mindThreadFixture,
  renderWithRouter,
} from "@/__test-fixtures__";
import { AppLogoTestId } from "@/components/shared";
import { ColorModeButtonTestId } from "@/components/lib/color-mode/components/ColorModeButton/ColorModeButton.constants";
import { AppPath } from "@/routing/routing.constants";
import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
import type { MindThread } from "@/types";
import { ThreadHeader } from "../ThreadHeader";
import { ThreadHeaderTestId } from "../ThreadHeader.constants";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const THREAD_PATH = "/threads/test-thread";
const THREAD_TITLE = "Testing Strategy";
const THREAD_COLOR = "#FF6B6B";
const THEME_SCOPE_SELECTOR = ".chakra-theme";
const THREAD = { ...mindThreadFixture, title: THREAD_TITLE };

const setup = (thread: MindThread | null) => {
  const user = userEvent.setup();

  renderWithRouter({
    ui: <ThreadHeader thread={thread} />,
    path: AppPath.Thread,
    initialPath: THREAD_PATH,
  });

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ThreadHeader", () => {
  it("renders the logo, back button, title and color mode toggle in that order", () => {
    setup(THREAD);

    const logo = screen.getByTestId(AppLogoTestId.container);
    const backButton = screen.getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    const title = screen.getByTestId(ThreadHeaderTestId.title);
    const colorModeToggle = screen.getByTestId(ColorModeButtonTestId.container);

    expect(isFollowing({ element: backButton, previousElement: logo })).toBe(
      true
    );

    expect(isFollowing({ element: title, previousElement: backButton })).toBe(
      true
    );

    expect(
      isFollowing({ element: colorModeToggle, previousElement: title })
    ).toBe(true);
  });

  it("sets the header background to the thread color", () => {
    setup(THREAD);

    const header = screen.getByTestId(ThreadHeaderTestId.container);
    expect(header).toHaveStyle({ backgroundColor: THREAD_COLOR });
  });

  it("wraps the header items in a forced color scope", () => {
    setup(THREAD);

    const header = screen.getByTestId(ThreadHeaderTestId.container);
    const themeScope = header.querySelector(THEME_SCOPE_SELECTOR);

    expect(themeScope).toBeInTheDocument();
  });

  it("keeps the thread color when the color mode is toggled", async () => {
    const { user } = setup(THREAD);

    const colorModeToggle = screen.getByTestId(ColorModeButtonTestId.container);

    await user.click(colorModeToggle);

    const header = screen.getByTestId(ThreadHeaderTestId.container);

    expect(mockUseColorModeReturn.toggleColorMode).toHaveBeenCalledTimes(1);
    expect(header).toHaveStyle({ backgroundColor: THREAD_COLOR });
  });

  it("renders the back button, logo and toggle without a title when there is no thread", () => {
    setup(null);

    const backButton = screen.getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    const logo = screen.getByTestId(AppLogoTestId.container);
    const colorModeToggle = screen.getByTestId(ColorModeButtonTestId.container);
    const title = screen.queryByTestId(ThreadHeaderTestId.title);

    expect(backButton).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(colorModeToggle).toBeInTheDocument();
    expect(title).not.toBeInTheDocument();
  });

  it("uses no thread background and no forced color scope when there is no thread", () => {
    setup(null);

    const header = screen.getByTestId(ThreadHeaderTestId.container);
    const themeScope = header.querySelector(THEME_SCOPE_SELECTOR);

    expect(header.style.backgroundColor).toBe("");
    expect(themeScope).toBeNull();
  });
});

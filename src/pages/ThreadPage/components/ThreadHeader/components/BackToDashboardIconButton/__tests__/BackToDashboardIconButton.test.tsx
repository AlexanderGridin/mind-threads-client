import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LOCATION_MARKER_TEST_ID, renderWithRouter } from "@/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
import { LocationMarker } from "@/__test-fixtures__/LocationMarker";
import { BackToDashboardIconButton } from "../BackToDashboardIconButton";

const THREAD_PATH = "/threads/test-thread";

const setup = () => {
  const user = userEvent.setup();

  renderWithRouter({
    ui: (
      <>
        <BackToDashboardIconButton />
        <LocationMarker />
      </>
    ),
    path: AppPath.Thread,
    initialPath: THREAD_PATH,
  });

  return { user };
};

describe("BackToDashboardIconButton", () => {
  it('renders a button named "Back to Dashboard"', () => {
    setup();

    const backButton = screen.getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeEnabled();
  });

  it("navigates to the dashboard when clicked", async () => {
    const { user } = setup();

    const backButton = screen.getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    let locationMarker = screen.getByTestId(LOCATION_MARKER_TEST_ID);
    expect(locationMarker.textContent).toBe(THREAD_PATH);

    await user.click(backButton);

    locationMarker = screen.getByTestId(LOCATION_MARKER_TEST_ID);
    expect(locationMarker.textContent).toBe("/");
  });
});

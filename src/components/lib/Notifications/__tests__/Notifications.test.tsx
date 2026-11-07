import { describe, it, expect, afterEach, vi } from "vitest";
import { act, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { notify } from "@/components/lib";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  NOTIFICATION_DURATION_MS,
  NotificationsTestId,
} from "../Notifications.constants";
import { notificationsToaster } from "../Notifications.toaster";

const SUCCESS_MESSAGE = "Thread created.";
const ERROR_MESSAGE = "Couldn't save the thread. Please try again.";
const TOAST_REMOVAL_TIMEOUT_MS = 5000;

const setup = () => {
  const user = userEvent.setup({ delay: null });

  renderWithUIProvider(<div />);

  return { user };
};

const showSuccess = (message: string) => {
  act(() => notify.success(message));
};

const showError = (message: string) => {
  act(() => notify.error(message));
};

describe("Notifications", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a success notification with its message", async () => {
    setup();

    showSuccess(SUCCESS_MESSAGE);

    expect(await screen.findByText(SUCCESS_MESSAGE)).toBeInTheDocument();
  });

  it("renders an error notification with its message", async () => {
    setup();

    showError(ERROR_MESSAGE);

    expect(await screen.findByText(ERROR_MESSAGE)).toBeInTheDocument();
  });

  it("places the notification region at the bottom end of the screen", async () => {
    setup();

    showSuccess(SUCCESS_MESSAGE);

    await screen.findByText(SUCCESS_MESSAGE);

    expect(
      document.querySelector('[data-placement="bottom-end"]')
    ).toBeInTheDocument();
  });

  it("removes the notification when its close button is clicked", async () => {
    const { user } = setup();

    showSuccess(SUCCESS_MESSAGE);

    const notification = await screen.findByText(SUCCESS_MESSAGE);

    await user.click(
      await screen.findByTestId(NotificationsTestId.closeButton)
    );

    await waitForElementToBeRemoved(notification, {
      timeout: TOAST_REMOVAL_TIMEOUT_MS,
    });
  });

  it("creates each notification with NOTIFICATION_DURATION_MS and a close control", () => {
    const createSpy = vi.spyOn(notificationsToaster, "create");

    setup();

    showSuccess(SUCCESS_MESSAGE);

    expect(createSpy.mock.calls[0][0]).toStrictEqual({
      type: "success",
      title: SUCCESS_MESSAGE,
      duration: NOTIFICATION_DURATION_MS,
      closable: true,
    });
  });
});

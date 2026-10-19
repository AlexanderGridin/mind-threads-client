import { initTestIdCreator } from "../utils";

const createTestId = initTestIdCreator("Notifications__");

export const NotificationsTestId = {
  notification: createTestId("notification"),
  closeButton: createTestId("close-button"),
} as const;

export const NOTIFICATION_DURATION_MS = 5000;
export const NOTIFICATION_PLACEMENT = "bottom-end";
export const CLOSE_NOTIFICATION_LABEL = "Close notification";

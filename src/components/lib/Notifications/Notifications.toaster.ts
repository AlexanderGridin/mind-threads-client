import { createToaster } from "@chakra-ui/react";
import {
  NOTIFICATION_DURATION_MS,
  NOTIFICATION_PLACEMENT,
} from "./Notifications.constants";
import type { NotificationType } from "./Notifications.types";

export const notificationsToaster = createToaster({
  placement: NOTIFICATION_PLACEMENT,
  pauseOnPageIdle: true,
});

type ShowNotificationParams = {
  type: NotificationType;
  message: string;
};

const showNotification = ({ type, message }: ShowNotificationParams) => {
  notificationsToaster.create({
    type,
    title: message,
    duration: NOTIFICATION_DURATION_MS,
    closable: true,
  });
};

export const notify = {
  success: (message: string) => showNotification({ type: "success", message }),
  error: (message: string) => showNotification({ type: "error", message }),
};

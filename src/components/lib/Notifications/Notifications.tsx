import { Portal, Toast, Toaster } from "@chakra-ui/react";
import {
  CLOSE_NOTIFICATION_LABEL,
  NotificationsTestId,
} from "./Notifications.constants";
import { notificationsToaster } from "./Notifications.toaster";

export const Notifications = () => (
  <Portal>
    <Toaster toaster={notificationsToaster} insetInline={{ mdDown: "4" }}>
      {(toast) => (
        <Toast.Root
          data-testid={NotificationsTestId.notification}
          width={{ md: "sm" }}
          bg="bg.subtle"
          color="fg"
          borderWidth="1px"
          borderColor="border"
        >
          <Toast.Indicator color={toast.type === "error" ? "red" : "green"} />
          <Toast.Title flex="1">{toast.title}</Toast.Title>

          <Toast.CloseTrigger
            data-testid={NotificationsTestId.closeButton}
            aria-label={CLOSE_NOTIFICATION_LABEL}
          />
        </Toast.Root>
      )}
    </Toaster>
  </Portal>
);

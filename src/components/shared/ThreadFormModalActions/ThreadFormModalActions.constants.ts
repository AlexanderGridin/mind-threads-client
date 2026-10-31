import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadFormModalActions__");

export const ThreadFormModalActionsTestId = {
  container: createTestId("container"),
  cancelButton: createTestId("cancel-button"),
  submitButton: createTestId("submit-button"),
} as const;

export const CANCEL_BUTTON_LABEL = "Cancel";

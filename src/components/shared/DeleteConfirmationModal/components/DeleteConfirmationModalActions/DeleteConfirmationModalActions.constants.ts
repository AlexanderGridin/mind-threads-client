import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("DeleteConfirmationModalActions__");

export const DeleteConfirmationModalActionsTestId = {
  container: createTestId("container"),
  cancelButton: createTestId("cancel-button"),
  deleteButton: createTestId("delete-button"),
} as const;

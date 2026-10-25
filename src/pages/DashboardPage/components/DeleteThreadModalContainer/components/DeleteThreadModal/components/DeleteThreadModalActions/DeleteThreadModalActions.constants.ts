import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("DeleteThreadModalActions__");

export const DeleteThreadModalActionsTestId = {
  container: createTestId("container"),
  cancelButton: createTestId("cancel-button"),
  deleteButton: createTestId("delete-button"),
} as const;

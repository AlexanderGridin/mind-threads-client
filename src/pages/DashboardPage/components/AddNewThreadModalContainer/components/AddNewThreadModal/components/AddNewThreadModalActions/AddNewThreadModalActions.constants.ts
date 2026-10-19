import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("AddNewThreadModalActions__");

export const AddNewThreadModalActionsTestId = {
  container: createTestId("container"),
  addButton: createTestId("add-button"),
  cancelButton: createTestId("cancel-button"),
} as const;

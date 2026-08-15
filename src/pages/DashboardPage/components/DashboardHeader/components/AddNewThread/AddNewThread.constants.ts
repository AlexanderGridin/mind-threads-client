import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("AddNewThread__");

export const AddNewThreadTestId = {
  container: createTestId("container"),
  openModalButton: createTestId("open-modal-button"),
} as const;

export const ADD_NEW_THREAD_BUTTON_LABEL = "+ New Thread";

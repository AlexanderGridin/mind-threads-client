import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("MindThreadCard__");

export const MindThreadCardTestId = {
  container: createTestId("container"),
  contentContainer: createTestId("content-container"),
  title: createTestId("title"),
  sections: createTestId("sections"),
  pages: createTestId("pages"),
  lastUpdated: createTestId("last-updated"),
  colorBorderLeft: createTestId("color-border-left"),
  colorBorderTop: createTestId("color-border-top"),
  actions: createTestId("actions"),
  actionsMenu: createTestId("actions-menu"),
} as const;

export const DELETE_THREAD_MENU_ITEM = {
  value: "delete",
  label: "Delete",
} as const;

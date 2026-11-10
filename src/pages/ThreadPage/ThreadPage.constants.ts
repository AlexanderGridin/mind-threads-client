import { LuMessageSquare } from "react-icons/lu";
import { initTestIdCreator } from "@/components/lib/utils";
import type { SectionPageType } from "@/types";
import type { PageTypeConfig } from "./ThreadPage.types";

const createTestId = initTestIdCreator("ThreadPage__");

export const ThreadPageTestId = {
  container: createTestId("container"),
} as const;

export const ThreadStatus = {
  Loading: "loading",
  Loaded: "loaded",
  NotFound: "not-found",
  Error: "error",
} as const;

export const THREAD_PAGE_MIN_WIDTH = "768px";
export const LOADING_THREAD_LABEL = "Loading thread";
export const BACK_TO_DASHBOARD_LABEL = "Back to Dashboard";
export const THREAD_NOT_FOUND_MESSAGE =
  "This thread doesn't exist or was deleted.";
export const THREAD_LOAD_ERROR_MESSAGE =
  "Couldn't load this thread. Please reload the page.";

export const PAGE_TYPES: SectionPageType[] = ["chat"];

export const DEFAULT_PAGE_TYPE: SectionPageType = "chat";

export const PAGE_TYPE_CONFIG: Record<SectionPageType, PageTypeConfig> = {
  chat: { label: "Chat", icon: LuMessageSquare },
};

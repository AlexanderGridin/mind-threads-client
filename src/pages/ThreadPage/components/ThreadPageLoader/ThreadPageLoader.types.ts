import type { MindThread, ThreadSection, ThreadSectionValue } from "@/types";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";

export type ThreadPageValue = {
  thread: MindThread | null;
  sections: ThreadSection[];
  threadStatus: ThreadStatusType;
  isAddSectionModalOpen: boolean;
  isSavingSection: boolean;
  lastCreatedSectionId: string | null;
};

export type ThreadPageAction = {
  openAddSectionModal: () => void;
  closeAddSectionModal: () => void;
  submitNewSection: (sectionValue: ThreadSectionValue) => Promise<void>;
};

export type UseAddSectionParams = {
  addSection: (sectionValue: ThreadSectionValue) => Promise<ThreadSection>;
};

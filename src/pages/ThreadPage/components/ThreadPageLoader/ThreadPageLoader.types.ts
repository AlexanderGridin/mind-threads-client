import type { MindThread, ThreadSection, ThreadSectionValue } from "@/types";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";

export type ThreadPageValue = {
  thread: MindThread | null;
  sections: ThreadSection[];
  threadStatus: ThreadStatusType;
  isAddSectionModalOpen: boolean;
  isSavingSection: boolean;
  lastCreatedSectionId: string | null;
  sectionToDelete: ThreadSection | null;
  isDeletingSection: boolean;
};

export type ThreadPageAction = {
  openAddSectionModal: () => void;
  closeAddSectionModal: () => void;
  submitNewSection: (sectionValue: ThreadSectionValue) => Promise<void>;
  openDeleteSectionModal: (section: ThreadSection) => void;
  closeDeleteSectionModal: () => void;
  confirmDeleteSection: () => Promise<void>;
};

export type UseAddSectionParams = {
  addSection: (sectionValue: ThreadSectionValue) => Promise<ThreadSection>;
};

export type UseDeleteSectionParams = {
  removeSection: (sectionId: string) => Promise<void>;
};

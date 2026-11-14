import type {
  MindThread,
  SectionPage,
  SectionPageValue,
  ThreadSection,
  ThreadSectionValue,
} from "@/types";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";

export type AddPageParams = {
  sectionId: string;
  pageValue: SectionPageValue;
};

export type ThreadPageValue = {
  thread: MindThread | null;
  sections: ThreadSection[];
  threadStatus: ThreadStatusType;
  isAddSectionModalOpen: boolean;
  isSavingSection: boolean;
  lastCreatedSectionId: string | null;
  sectionToDelete: ThreadSection | null;
  isDeletingSection: boolean;
  pages: SectionPage[];
  selectedSection: ThreadSection | null;
  isAddPageModalOpen: boolean;
  isSavingPage: boolean;
  lastCreatedPageId: string | null;
};

export type ThreadPageAction = {
  openAddSectionModal: () => void;
  closeAddSectionModal: () => void;
  submitNewSection: (sectionValue: ThreadSectionValue) => Promise<void>;
  openDeleteSectionModal: (section: ThreadSection) => void;
  closeDeleteSectionModal: () => void;
  confirmDeleteSection: () => Promise<void>;
  selectSection: (sectionId: string) => void;
  openAddPageModal: () => void;
  closeAddPageModal: () => void;
  submitNewPage: (pageValue: SectionPageValue) => Promise<void>;
};

export type UseAddSectionParams = {
  addSection: (sectionValue: ThreadSectionValue) => Promise<ThreadSection>;
};

export type UseDeleteSectionParams = {
  removeSection: (sectionId: string) => Promise<void>;
};

export type UseSectionSelectionParams = {
  sections: ThreadSection[];
};

export type UseAddPageParams = {
  addPage: (params: AddPageParams) => Promise<SectionPage>;
  selectedSection: ThreadSection | null;
};

type CreatedItem = {
  id: string;
  name: string;
};

export type UseCreateModalParams<Value> = {
  create: (value: Value) => Promise<CreatedItem>;
  getCreatedMessage: (name: string) => string;
  errorMessage: string;
};

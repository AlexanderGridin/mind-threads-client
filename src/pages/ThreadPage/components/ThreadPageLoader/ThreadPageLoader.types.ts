import type {
  ChatMessage,
  MindThread,
  NewChatMessage,
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
  selectedPage: SectionPage | null;
  isAddPageModalOpen: boolean;
  isSavingPage: boolean;
  lastCreatedPageId: string | null;
  pageToDelete: SectionPage | null;
  isDeletingPage: boolean;
};

export type ThreadPageAction = {
  openAddSectionModal: () => void;
  closeAddSectionModal: () => void;
  submitNewSection: (sectionValue: ThreadSectionValue) => Promise<void>;
  openDeleteSectionModal: (section: ThreadSection) => void;
  closeDeleteSectionModal: () => void;
  confirmDeleteSection: () => Promise<void>;
  selectSection: (sectionId: string) => void;
  selectPage: (pageId: string) => void;
  openAddPageModal: () => void;
  closeAddPageModal: () => void;
  submitNewPage: (pageValue: SectionPageValue) => Promise<void>;
  openDeletePageModal: (page: SectionPage) => void;
  closeDeletePageModal: () => void;
  confirmDeletePage: () => Promise<void>;
  getPageMessages: (pageId: string) => Promise<ChatMessage[]>;
  addPageMessage: (newMessage: NewChatMessage) => Promise<ChatMessage>;
};

export type UseAddSectionParams = {
  addSection: (sectionValue: ThreadSectionValue) => Promise<ThreadSection>;
};

export type UseDeletePageParams = {
  removePage: (pageId: string) => Promise<void>;
};

export type UseDeleteSectionParams = {
  removeSection: (sectionId: string) => Promise<void>;
};

export type UseSectionSelectionParams = {
  sections: ThreadSection[];
};

export type UsePageSelectionParams = {
  pages: SectionPage[];
};

export type UseSectionSwitchParams = {
  selectedSection: ThreadSection | null;
  selectSection: (sectionId: string) => void;
  clearSelectedPage: () => void;
};

export type UseAddPageParams = {
  addPage: (params: AddPageParams) => Promise<SectionPage>;
  selectedSection: ThreadSection | null;
};

export type NamedItem = {
  id: string;
  name: string;
};

export type UseCreateModalParams<Value> = {
  create: (value: Value) => Promise<NamedItem>;
  getCreatedMessage: (name: string) => string;
  errorMessage: string;
};

export type UseDeleteModalParams = {
  remove: (itemId: string) => Promise<void>;
  getDeletedMessage: (name: string) => string;
  errorMessage: string;
};

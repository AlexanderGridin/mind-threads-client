import { useLocalStorage } from "@/hooks";
import type { NewThreadSection, ThreadSection } from "@/types";
import {
  INVALID_SECTIONS_DATA_ERROR,
  SECTIONS_STORAGE_KEY,
} from "./useThreadSectionsService.constants";
import type { UseThreadSectionsServiceReturn } from "./useThreadSectionsService.types";
import {
  buildSection,
  isThreadSectionList,
} from "./useThreadSectionsService.utils";

export const useThreadSectionsService = (): UseThreadSectionsServiceReturn => {
  const sectionsStorage = useLocalStorage<ThreadSection[]>({
    key: SECTIONS_STORAGE_KEY,
    throwOnError: true,
  });

  const getSections = async (): Promise<ThreadSection[]> => {
    const storedSections = sectionsStorage.read();

    if (!storedSections) {
      return [];
    }

    if (!isThreadSectionList(storedSections)) {
      throw new Error(INVALID_SECTIONS_DATA_ERROR);
    }

    return storedSections;
  };

  const getThreadSections = async (
    threadId: string
  ): Promise<ThreadSection[]> => {
    const storedSections = await getSections();

    return storedSections.filter((section) => {
      return section.threadId === threadId;
    });
  };

  const createThreadSection = async (
    newSection: NewThreadSection
  ): Promise<ThreadSection> => {
    const createdSection = buildSection(newSection);
    const storedSections = await getSections();

    sectionsStorage.set([...storedSections, createdSection]);

    return createdSection;
  };

  const deleteThreadSections = async (threadId: string): Promise<void> => {
    const storedSections = await getSections();

    const filteredSections = storedSections.filter((section) => {
      return section.threadId !== threadId;
    });

    sectionsStorage.set(filteredSections);
  };

  const deleteSection = async (sectionId: string): Promise<boolean> => {
    const storedSections = await getSections();

    const remainingSections = storedSections.filter((section) => {
      return section.id !== sectionId;
    });

    if (remainingSections.length === storedSections.length) {
      return false;
    }

    sectionsStorage.set(remainingSections);

    return true;
  };

  return {
    getThreadSections,
    createThreadSection,
    deleteThreadSections,
    deleteSection,
  };
};

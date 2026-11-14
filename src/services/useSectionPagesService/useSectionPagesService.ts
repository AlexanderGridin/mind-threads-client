import { useLocalStorage } from "@/hooks";
import type { NewSectionPage, SectionPage } from "@/types";
import {
  INVALID_PAGES_DATA_ERROR,
  PAGES_STORAGE_KEY,
} from "./useSectionPagesService.constants";
import type { UseSectionPagesServiceReturn } from "./useSectionPagesService.types";
import { buildPage, isSectionPageList } from "./useSectionPagesService.utils";

export const useSectionPagesService = (): UseSectionPagesServiceReturn => {
  const pagesStorage = useLocalStorage<SectionPage[]>({
    key: PAGES_STORAGE_KEY,
    throwOnError: true,
  });

  const getPages = async (): Promise<SectionPage[]> => {
    const storedPages = pagesStorage.read();

    if (!storedPages) {
      return [];
    }

    if (!isSectionPageList(storedPages)) {
      throw new Error(INVALID_PAGES_DATA_ERROR);
    }

    return storedPages;
  };

  const getThreadPages = async (threadId: string): Promise<SectionPage[]> => {
    const storedPages = await getPages();

    return storedPages.filter((page) => {
      return page.threadId === threadId;
    });
  };

  const createSectionPage = async (
    newPage: NewSectionPage
  ): Promise<SectionPage> => {
    const createdPage = buildPage(newPage);
    const storedPages = await getPages();

    pagesStorage.set([...storedPages, createdPage]);

    return createdPage;
  };

  const deleteSectionPages = async (sectionId: string): Promise<number> => {
    const storedPages = await getPages();

    const remainingPages = storedPages.filter((page) => {
      return page.sectionId !== sectionId;
    });

    const deletedPageCount = storedPages.length - remainingPages.length;

    if (deletedPageCount) {
      pagesStorage.set(remainingPages);
    }

    return deletedPageCount;
  };

  const deleteThreadPages = async (threadId: string): Promise<void> => {
    const storedPages = await getPages();

    const remainingPages = storedPages.filter((page) => {
      return page.threadId !== threadId;
    });

    pagesStorage.set(remainingPages);
  };

  return {
    getThreadPages,
    createSectionPage,
    deleteSectionPages,
    deleteThreadPages,
  };
};

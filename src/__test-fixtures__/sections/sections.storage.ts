import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import type { ThreadSection } from "@/types";

export const seedSections = (sections: ThreadSection[]) => {
  localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(sections));
};

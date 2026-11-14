import { initTestIdCreator } from "@/components/lib/utils";
import type { SectionPageType } from "@/types";

const createTestId = initTestIdCreator("PageTypeIcon__");

export const PageTypeIconTestId: Record<SectionPageType, string> = {
  chat: createTestId("chat"),
};

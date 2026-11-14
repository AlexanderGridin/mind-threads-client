import type { NewSectionPage, SectionPage } from "@/types";
import { mindThreadFixtures } from "../threads/threads";
import { threadSectionFixtures } from "../sections/sections";

export const sectionPageFixtures: SectionPage[] = [
  {
    id: "page-1",
    threadId: mindThreadFixtures[0].id,
    sectionId: threadSectionFixtures[0].id,
    name: "Brainstorm",
    type: "chat",
    color: "#A3BE8C",
    createdAt: "2026-06-25T12:00:00.000Z",
  },
  {
    id: "page-2",
    threadId: mindThreadFixtures[0].id,
    sectionId: threadSectionFixtures[0].id,
    name: "Shortlist",
    type: "chat",
    color: "#EBCB8B",
    createdAt: "2026-06-26T12:00:00.000Z",
  },
  {
    id: "page-3",
    threadId: mindThreadFixtures[0].id,
    sectionId: threadSectionFixtures[1].id,
    name: "Sources",
    type: "chat",
    color: "#88C0D0",
    createdAt: "2026-06-27T12:00:00.000Z",
  },
  {
    id: "page-4",
    threadId: mindThreadFixtures[1].id,
    sectionId: threadSectionFixtures[2].id,
    name: "Outline",
    type: "chat",
    color: "#B48EAD",
    createdAt: "2026-06-28T12:00:00.000Z",
  },
];

export const buildNewPage = (
  overrides: Partial<NewSectionPage> = {}
): NewSectionPage => {
  return {
    threadId: mindThreadFixtures[0].id,
    sectionId: threadSectionFixtures[0].id,
    name: "Ideas",
    type: "chat",
    color: "#A3BE8C",
    ...overrides,
  };
};

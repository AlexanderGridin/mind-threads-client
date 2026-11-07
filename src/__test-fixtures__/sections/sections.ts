import type { ThreadSection } from "@/types";
import { mindThreadFixtures } from "../threads/threads";

export const threadSectionFixtures: ThreadSection[] = [
  {
    id: "section-1",
    threadId: mindThreadFixtures[0].id,
    name: "Ideas",
    color: "#A3BE8C",
    createdAt: "2026-06-20T12:00:00.000Z",
  },
  {
    id: "section-2",
    threadId: mindThreadFixtures[0].id,
    name: "Research",
    color: "#EBCB8B",
    createdAt: "2026-06-21T12:00:00.000Z",
  },
  {
    id: "section-3",
    threadId: mindThreadFixtures[1].id,
    name: "Drafts",
    color: "#88C0D0",
    createdAt: "2026-06-22T12:00:00.000Z",
  },
];

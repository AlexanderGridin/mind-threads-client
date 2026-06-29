import type { MindThread } from "@/types";

export const mindThreadFixture: MindThread = {
  title: "Test Thread",
  totalSections: 5,
  totalPages: 15,
  lastUpdated: "2026-06-20T12:00:00Z",
  color: "#FF6B6B",
};

export const mindThreadFixtures: MindThread[] = [
  {
    title: "Thread One",
    totalSections: 3,
    totalPages: 10,
    lastUpdated: "2026-06-20T12:00:00Z",
    color: "#FF6B6B",
  },
  {
    title: "Thread Two",
    totalSections: 5,
    totalPages: 20,
    lastUpdated: "2026-06-21T12:00:00Z",
    color: "#4ECDC4",
  },
];

export const mindThreadFixturesWithSingleItem: MindThread[] = [
  mindThreadFixture,
];

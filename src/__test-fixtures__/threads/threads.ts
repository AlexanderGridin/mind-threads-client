import type { MindThread } from "@/types";

export const mindThreadFixture: MindThread = {
  id: "test-thread",
  title: "Test Thread",
  totalSections: 5,
  totalPages: 15,
  lastUpdated: "2026-06-20T12:00:00Z",
  color: "#FF6B6B",
};

export const mindThreadFixtures: MindThread[] = [
  {
    id: "thread-1",
    title: "Thread One",
    totalSections: 3,
    totalPages: 10,
    lastUpdated: "2026-06-20T12:00:00Z",
    color: "#FF6B6B",
  },
  {
    id: "thread-2",
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

export const mindThreadFixturesWithSameTitle: MindThread[] = [
  {
    id: "same-title-1",
    title: "Testing Strategy",
    totalSections: 8,
    totalPages: 25,
    lastUpdated: "2026-06-23T08:45:00Z",
    color: "#A8E6CF",
  },
  {
    id: "same-title-2",
    title: "Testing Strategy",
    totalSections: 0,
    totalPages: 0,
    lastUpdated: "2026-06-24T09:00:00Z",
    color: "#FFAAA5",
  },
];

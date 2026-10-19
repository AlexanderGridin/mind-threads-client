export type MindThread = {
  id: string;
  title: string;
  color: string;
  totalSections: number;
  totalPages: number;
  lastUpdated: string;
};

export type NewMindThread = Pick<MindThread, "title" | "color">;

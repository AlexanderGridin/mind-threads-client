import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import type { MindThread } from "@/types";

export const seedThreads = (threads: MindThread[]) => {
  localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
};

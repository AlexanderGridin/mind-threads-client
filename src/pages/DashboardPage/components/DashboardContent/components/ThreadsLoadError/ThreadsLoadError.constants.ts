import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("ThreadsLoadError__");

export const ThreadsLoadErrorTestId = {
  container: createTestId("container"),
  message: createTestId("message"),
} as const;

export const THREADS_LOAD_ERROR_MESSAGE =
  "Couldn't load your threads. Please reload the page.";

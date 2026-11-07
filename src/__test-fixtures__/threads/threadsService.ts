import type { UseThreadsServiceReturn } from "@/services";

type ServicesModule = typeof import("@/services");

type ThreadsServiceOverrides = Partial<
  Pick<
    UseThreadsServiceReturn,
    "getThread" | "updateThread" | "deleteThread" | "addThreadSection"
  >
>;

export const threadsServiceOverrides: ThreadsServiceOverrides = {};

export const resetThreadsServiceOverrides = () => {
  delete threadsServiceOverrides.getThread;
  delete threadsServiceOverrides.updateThread;
  delete threadsServiceOverrides.deleteThread;
  delete threadsServiceOverrides.addThreadSection;
};

export const createServicesMock = (
  actualServices: ServicesModule
): ServicesModule => ({
  ...actualServices,
  useThreadsService: () => {
    const threadsService = actualServices.useThreadsService();

    return {
      ...threadsService,
      getThread: (threadId) =>
        (threadsServiceOverrides.getThread ?? threadsService.getThread)(
          threadId
        ),
      updateThread: (threadUpdate) =>
        (threadsServiceOverrides.updateThread ?? threadsService.updateThread)(
          threadUpdate
        ),
      deleteThread: (threadId) =>
        (threadsServiceOverrides.deleteThread ?? threadsService.deleteThread)(
          threadId
        ),
      addThreadSection: (newSection) =>
        (
          threadsServiceOverrides.addThreadSection ??
          threadsService.addThreadSection
        )(newSection),
    };
  },
});

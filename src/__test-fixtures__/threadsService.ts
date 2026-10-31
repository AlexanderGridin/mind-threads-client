import type { UseThreadsServiceReturn } from "@/services";

type ServicesModule = typeof import("@/services");

type ThreadsServiceOverrides = Partial<
  Pick<UseThreadsServiceReturn, "updateThread" | "deleteThread">
>;

export const threadsServiceOverrides: ThreadsServiceOverrides = {};

export const resetThreadsServiceOverrides = () => {
  delete threadsServiceOverrides.updateThread;
  delete threadsServiceOverrides.deleteThread;
};

export const createServicesMock = (
  actualServices: ServicesModule
): ServicesModule => ({
  ...actualServices,
  useThreadsService: () => {
    const threadsService = actualServices.useThreadsService();

    return {
      ...threadsService,
      updateThread: (threadUpdate) =>
        (threadsServiceOverrides.updateThread ?? threadsService.updateThread)(
          threadUpdate
        ),
      deleteThread: (threadId) =>
        (threadsServiceOverrides.deleteThread ?? threadsService.deleteThread)(
          threadId
        ),
    };
  },
});

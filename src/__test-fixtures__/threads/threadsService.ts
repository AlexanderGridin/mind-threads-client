import type { UseThreadsServiceReturn } from "@/services";

type ServicesModule = typeof import("@/services");

type ThreadsServiceOverrides = Partial<
  Pick<
    UseThreadsServiceReturn,
    | "getThread"
    | "updateThread"
    | "deleteThread"
    | "addThreadSection"
    | "removeThreadSection"
    | "addSectionPage"
    | "removeSectionPage"
    | "getPageMessages"
    | "addPageMessage"
  >
>;

export const threadsServiceOverrides: ThreadsServiceOverrides = {};

export const resetThreadsServiceOverrides = () => {
  delete threadsServiceOverrides.getThread;
  delete threadsServiceOverrides.updateThread;
  delete threadsServiceOverrides.deleteThread;
  delete threadsServiceOverrides.addThreadSection;
  delete threadsServiceOverrides.removeThreadSection;
  delete threadsServiceOverrides.addSectionPage;
  delete threadsServiceOverrides.removeSectionPage;
  delete threadsServiceOverrides.getPageMessages;
  delete threadsServiceOverrides.addPageMessage;
};

export const LOAD_MESSAGES_ERROR = "Messages could not be loaded";
export const ADD_MESSAGE_ERROR = "Storage quota exceeded";

export const failPageMessagesLoad = () => {
  threadsServiceOverrides.getPageMessages = async () => {
    throw new Error(LOAD_MESSAGES_ERROR);
  };
};

export const failPageMessageAdd = () => {
  threadsServiceOverrides.addPageMessage = async () => {
    throw new Error(ADD_MESSAGE_ERROR);
  };
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
      removeThreadSection: (removeParams) => {
        return (
          threadsServiceOverrides.removeThreadSection ??
          threadsService.removeThreadSection
        )(removeParams);
      },
      addSectionPage: (newPage) =>
        (
          threadsServiceOverrides.addSectionPage ??
          threadsService.addSectionPage
        )(newPage),
      removeSectionPage: (removeParams) => {
        return (
          threadsServiceOverrides.removeSectionPage ??
          threadsService.removeSectionPage
        )(removeParams);
      },
      getPageMessages: (pageId) => {
        return (
          threadsServiceOverrides.getPageMessages ??
          threadsService.getPageMessages
        )(pageId);
      },
      addPageMessage: (newMessage) => {
        return (
          threadsServiceOverrides.addPageMessage ??
          threadsService.addPageMessage
        )(newMessage);
      },
    };
  },
});

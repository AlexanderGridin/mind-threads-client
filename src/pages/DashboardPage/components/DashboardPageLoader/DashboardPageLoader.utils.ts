export const getThreadCreatedMessage = (threadTitle: string) =>
  `Thread "${threadTitle}" created.`;

export const getThreadUpdatedMessage = (threadTitle: string) => {
  return `Thread "${threadTitle}" updated.`;
};

export const getThreadDeletedMessage = (threadTitle: string) =>
  `Thread "${threadTitle}" deleted.`;

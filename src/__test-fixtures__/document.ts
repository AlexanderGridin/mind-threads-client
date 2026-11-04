type IsFollowingParams = {
  element: HTMLElement;
  previousElement: HTMLElement;
};

export const isFollowing = ({
  element,
  previousElement,
}: IsFollowingParams) => {
  // compareDocumentPosition() returns a bitmask that describes where the
  // argument node sits in the document relative to the node it is called on.
  // Each bit is a flag: DOCUMENT_POSITION_FOLLOWING (4) means the argument
  // comes after the caller in document order. Other flags (PRECEDING,
  // CONTAINS, CONTAINED_BY) can be set at the same time.
  const documentPositionBitmask =
    previousElement.compareDocumentPosition(element);

  // The & operator keeps only the bits set in both numbers. Masking with
  // FOLLOWING gives 4 when the flag is set and 0 when it is not.
  const followingFlag =
    documentPositionBitmask & Node.DOCUMENT_POSITION_FOLLOWING;

  // Boolean() turns 4 into true and 0 into false, so the test can compare
  // the result with toBe(true).
  return Boolean(followingFlag);
};

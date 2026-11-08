export const isTextTruncated = (element: HTMLElement | null) => {
  if (!element) {
    return false;
  }

  return element.scrollWidth > element.clientWidth;
};

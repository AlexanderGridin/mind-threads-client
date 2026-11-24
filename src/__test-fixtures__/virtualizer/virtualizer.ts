import { vi } from "vitest";

const DEFAULT_VIEWPORT_HEIGHT = 600;
const DEFAULT_ROW_HEIGHT = 100;

type StubVirtualizerLayoutParams = {
  viewportHeight?: number;
  rowHeight?: number;
};

// jsdom has no layout. The virtualizer reads the scroll element's clientHeight
// for the viewport and each measured row's offsetHeight for its size.
export const stubVirtualizerLayout = ({
  viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
}: StubVirtualizerLayoutParams = {}) => {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
    viewportHeight
  );

  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
    rowHeight
  );
};

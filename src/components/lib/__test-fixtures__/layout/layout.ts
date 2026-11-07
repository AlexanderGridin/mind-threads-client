import { vi } from "vitest";

const OVERFLOWING_SCROLL_WIDTH = 200;
const FITTING_SCROLL_WIDTH = 100;
const CLIENT_WIDTH = 100;

// jsdom has no layout, so the text overflow is stubbed through the size props.
export const stubTextOverflow = ({
  isOverflowing,
}: {
  isOverflowing: boolean;
}) => {
  const scrollWidth = isOverflowing
    ? OVERFLOWING_SCROLL_WIDTH
    : FITTING_SCROLL_WIDTH;

  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(
    scrollWidth
  );

  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
    CLIENT_WIDTH
  );
};

import { vi } from "vitest";
import type userEvent from "@testing-library/user-event";

// jsdom lays out every element at (0, 0) with no size, so the pointer must land
// far away from the origin to count as outside an overlay.
const OUTSIDE_POINTER_POSITION = 10_000;

// jsdom has no layout, so Zag would not focus an element with no size.
export const stubLayout = () => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
};

// Zag attaches its dismiss listeners (Escape and outside interaction) asynchronously,
// after an overlay opens. A short tick is not enough in jsdom, so wait longer.
export const waitForDismissListeners = async () => {
  const promise = new Promise((resolve) => setTimeout(resolve, 100));
  await promise;
};

type ClickOutsideOptions = {
  shouldWaitForDismissListeners?: boolean;
};

export const clickOutside = async (
  user: ReturnType<typeof userEvent.setup>,
  { shouldWaitForDismissListeners = true }: ClickOutsideOptions = {}
) => {
  if (shouldWaitForDismissListeners) {
    await waitForDismissListeners();
  }

  await user.pointer({
    keys: "[MouseLeft]",
    target: document.body,
    coords: {
      clientX: OUTSIDE_POINTER_POSITION,
      clientY: OUTSIDE_POINTER_POSITION,
    },
  });
};

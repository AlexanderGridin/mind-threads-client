import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { useScrollIntoView } from "../useScrollIntoView";

type UseScrollIntoViewProps = {
  shouldScroll: boolean;
};

const setupHook = (shouldScroll: boolean) => {
  return renderHook(
    (props: UseScrollIntoViewProps) => {
      return useScrollIntoView<HTMLDivElement>(props.shouldScroll);
    },
    { initialProps: { shouldScroll } }
  );
};

const attachElement = (ref: RefObject<HTMLDivElement | null>) => {
  const element = document.createElement("div");
  const scrollIntoView = vi.fn();

  element.scrollIntoView = scrollIntoView;
  ref.current = element;

  return scrollIntoView;
};

describe("useScrollIntoView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scrolls the element with block nearest when shouldScroll becomes true", () => {
    const { result, rerender } = setupHook(false);
    const scrollIntoView = attachElement(result.current);

    rerender({ shouldScroll: true });

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("does not scroll the element while shouldScroll is false", () => {
    const { result, rerender } = setupHook(false);
    const scrollIntoView = attachElement(result.current);

    rerender({ shouldScroll: false });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls again each time shouldScroll changes from false to true", () => {
    const { result, rerender } = setupHook(false);
    const scrollIntoView = attachElement(result.current);

    rerender({ shouldScroll: true });
    rerender({ shouldScroll: false });
    rerender({ shouldScroll: true });

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });
});

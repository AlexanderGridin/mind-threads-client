import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "../useDocumentTitle";

const DASHBOARD_TITLE = "Dashboard title";
const THREAD_TITLE = "Testing Strategy · Mind Threads";
const UPDATED_THREAD_TITLE = "Architecture · Mind Threads";

type UseDocumentTitleProps = {
  title: string;
};

const setupHook = ({ title }: UseDocumentTitleProps) => {
  return renderHook(
    (props: UseDocumentTitleProps) => {
      useDocumentTitle(props.title);
    },
    { initialProps: { title } }
  );
};

describe("useDocumentTitle", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    document.title = DASHBOARD_TITLE;
  });

  it("sets the document title to the given title", () => {
    setupHook({ title: THREAD_TITLE });

    expect(document.title).toBe(THREAD_TITLE);
  });

  it("updates the document title when the title changes", () => {
    const { rerender } = setupHook({ title: THREAD_TITLE });

    rerender({ title: UPDATED_THREAD_TITLE });

    expect(document.title).toBe(UPDATED_THREAD_TITLE);
  });

  it("restores the previous document title on unmount", () => {
    const { unmount } = setupHook({ title: THREAD_TITLE });

    unmount();

    expect(document.title).toBe(DASHBOARD_TITLE);
  });

  it("restores the previous document title on unmount after the title changed", () => {
    const { rerender, unmount } = setupHook({ title: THREAD_TITLE });

    rerender({ title: UPDATED_THREAD_TITLE });
    unmount();

    expect(document.title).toBe(DASHBOARD_TITLE);
  });
});

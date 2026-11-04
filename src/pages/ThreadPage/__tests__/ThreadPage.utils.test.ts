import { describe, it, expect } from "vitest";
import { mindThreadFixture } from "@/__test-fixtures__";
import { ThreadStatus } from "../ThreadPage.constants";
import { getThreadPageTitle } from "../ThreadPage.utils";

const LOADED_THREAD_TITLE = "Testing Strategy";

describe("getThreadPageTitle", () => {
  it("returns the thread title with the app name for a loaded thread", () => {
    const expectedPageTitle = "Testing Strategy · Mind Threads";
    const thread = { ...mindThreadFixture, title: LOADED_THREAD_TITLE };

    const pageTitle = getThreadPageTitle({
      thread,
      threadStatus: ThreadStatus.Loaded,
    });

    expect(pageTitle).toBe(expectedPageTitle);
  });

  it("returns only the app name while the thread is loading", () => {
    const expectedPageTitle = "Mind Threads";

    const pageTitle = getThreadPageTitle({
      thread: null,
      threadStatus: ThreadStatus.Loading,
    });

    expect(pageTitle).toBe(expectedPageTitle);
  });

  it("returns the not-found title with the app name when the thread does not exist", () => {
    const expectedPageTitle = "Thread not found · Mind Threads";

    const pageTitle = getThreadPageTitle({
      thread: null,
      threadStatus: ThreadStatus.NotFound,
    });

    expect(pageTitle).toBe(expectedPageTitle);
  });

  it("returns only the app name when the thread fails to load", () => {
    const expectedPageTitle = "Mind Threads";

    const pageTitle = getThreadPageTitle({
      thread: null,
      threadStatus: ThreadStatus.Error,
    });

    expect(pageTitle).toBe(expectedPageTitle);
  });
});

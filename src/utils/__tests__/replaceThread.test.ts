import { describe, it, expect } from "vitest";
import { mindThreadFixtures } from "@/__test-fixtures__";
import { replaceThread } from "../replaceThread";

const setup = () => {
  const [firstThread, secondThread] = mindThreadFixtures;

  const updatedSecondThread = {
    ...secondThread,
    title: "QA Strategy",
    color: "#000000",
  };

  return { firstThread, secondThread, updatedSecondThread };
};

describe("replaceThread", () => {
  it("replaces the thread with the same id and keeps the other threads in order", () => {
    const { firstThread, updatedSecondThread } = setup();

    const result = replaceThread({
      threads: mindThreadFixtures,
      updatedThread: updatedSecondThread,
    });

    expect(result).toStrictEqual([firstThread, updatedSecondThread]);
  });

  it("returns a list equal to the input when no thread has that id", () => {
    const unknownThread = { ...mindThreadFixtures[0], id: "unknown-id" };

    const result = replaceThread({
      threads: mindThreadFixtures,
      updatedThread: unknownThread,
    });

    expect(result).toStrictEqual(mindThreadFixtures);
  });

  it("does not mutate the input array", () => {
    const { updatedSecondThread } = setup();

    const result = replaceThread({
      threads: mindThreadFixtures,
      updatedThread: updatedSecondThread,
    });

    expect(result).not.toBe(mindThreadFixtures);
  });
});

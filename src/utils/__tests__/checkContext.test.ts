import { describe, it, expect } from "vitest";
import { checkContext } from "../checkContext";

describe("checkContext", () => {
  it("returns the context when it is truthy", () => {
    const simpleContext = { value: "test" };

    expect(checkContext(simpleContext, "TestContext", "useTest")).toStrictEqual(
      simpleContext
    );

    const complexContext = {
      user: { id: 1, name: "John" },
      isLoading: false,
      data: [1, 2, 3],
    };

    expect(checkContext(complexContext, "AppContext", "useApp")).toStrictEqual(
      complexContext
    );

    const emptyContext = {};

    expect(
      checkContext(emptyContext, "EmptyContext", "useEmpty")
    ).toStrictEqual(emptyContext);
  });

  it("throws error with correct message when context is null or undefined", () => {
    expect(() => {
      checkContext(null, "TestContext", "useTest");
    }).toThrow(
      "[TestContext] is not found! useTest must be used within a TestContext provider."
    );

    expect(() => {
      checkContext(undefined, "MyContext", "useMyHook");
    }).toThrow(
      "[MyContext] is not found! useMyHook must be used within a MyContext provider."
    );
  });

  it("throws error for other falsy values (0, false, empty string)", () => {
    expect(() => {
      checkContext(0 as unknown as null, "NumberContext", "useNumber");
    }).toThrow("[NumberContext] is not found!");

    expect(() => {
      checkContext(false as unknown as null, "BooleanContext", "useBoolean");
    }).toThrow("[BooleanContext] is not found!");

    expect(() => {
      checkContext("" as unknown as null, "StringContext", "useString");
    }).toThrow("[StringContext] is not found!");
  });
});

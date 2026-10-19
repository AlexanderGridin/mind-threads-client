import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { MALFORMED_JSON } from "@/__test-fixtures__";
import { useLocalStorage } from "../useLocalStorage";
import type { UseLocalStorageParams } from "../useLocalStorage.types";

const TEST_STORAGE_KEY = "test-key";

const TEST_VALUE = "test-value";
const NEW_VALUE = "new-value";

const TEST_VALUE_1 = "value1";
const TEST_VALUE_2 = "value2";

beforeEach(() => {
  localStorage.clear();
});

const setup = <ValueType = string>({
  key = TEST_STORAGE_KEY,
  throwOnError,
}: Partial<UseLocalStorageParams> = {}) => {
  return renderHook(() => useLocalStorage<ValueType>({ key, throwOnError }));
};

describe("useLocalStorage", () => {
  it("read() returns null when the key is not present", () => {
    const { result } = setup();

    expect(result.current.read()).toBeNull();
  });

  it("read() returns a cached non-null value on a second call without re-reading localStorage", () => {
    const { result } = setup();

    localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(TEST_VALUE));

    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    const firstRead = result.current.read();
    const secondRead = result.current.read();

    expect(firstRead).toBe(TEST_VALUE);
    expect(secondRead).toBe(TEST_VALUE);

    expect(getItemSpy).toHaveBeenCalledTimes(1);

    getItemSpy.mockRestore();
  });

  it("read() re-reads localStorage on every call when the key is absent (cached value is null)", () => {
    const { result } = setup();

    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    const firstRead = result.current.read();
    const secondRead = result.current.read();

    expect(firstRead).toBeNull();
    expect(secondRead).toBeNull();

    expect(getItemSpy).toHaveBeenCalledTimes(2);

    getItemSpy.mockRestore();
  });

  it("set(newValue) persists the value to localStorage and updates the cache", () => {
    const { result } = setup();

    result.current.set(NEW_VALUE);

    expect(localStorage.getItem(TEST_STORAGE_KEY)).toBe(
      JSON.stringify(NEW_VALUE)
    );

    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    const cachedRead = result.current.read();

    expect(cachedRead).toBe(NEW_VALUE);
    expect(getItemSpy).toHaveBeenCalledTimes(0);

    getItemSpy.mockRestore();
  });

  it("update((prevValue) => updatedValue) receives the previously cached/read value and persists the result", () => {
    const { result } = setup<number>();

    localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(5));

    result.current.update((prevValue) => (prevValue ?? 0) + 1);

    expect(localStorage.getItem(TEST_STORAGE_KEY)).toBe(JSON.stringify(6));
    expect(result.current.read()).toBe(6);
  });

  it("read() catches a malformed stored value, logs via console.error, and returns null", () => {
    const { result } = setup();

    localStorage.setItem(TEST_STORAGE_KEY, MALFORMED_JSON);

    const consoleErrorSpy = vi.spyOn(console, "error");
    const readValue = result.current.read();

    expect(readValue).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Failed to read from localStorage for key "${TEST_STORAGE_KEY}":`,
      new SyntaxError("Unexpected token 'o', \"not-json\" is not valid JSON")
    );

    consoleErrorSpy.mockRestore();
  });

  it("two independent renderHook calls with different key values do not share a cache", () => {
    const { result: result1 } = setup({ key: "key1" });
    const { result: result2 } = setup({ key: "key2" });

    localStorage.setItem("key1", JSON.stringify(TEST_VALUE_1));
    localStorage.setItem("key2", JSON.stringify(TEST_VALUE_2));

    expect(result1.current.read()).toBe(TEST_VALUE_1);
    expect(result2.current.read()).toBe(TEST_VALUE_2);
  });

  it("set() catches errors when localStorage.setItem fails and logs via console.error", () => {
    const { result } = setup();

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

    const consoleErrorSpy = vi.spyOn(console, "error");

    result.current.set(NEW_VALUE);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Failed to write to localStorage for key "${TEST_STORAGE_KEY}":`,
      new Error("Storage quota exceeded")
    );

    expect(localStorage.getItem(TEST_STORAGE_KEY)).toBeNull();

    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("with throwOnError", () => {
    it("read() throws a malformed stored value and still logs via console.error", () => {
      const { result } = setup({ throwOnError: true });

      localStorage.setItem(TEST_STORAGE_KEY, MALFORMED_JSON);

      const consoleErrorSpy = vi.spyOn(console, "error");

      expect(() => result.current.read()).toThrow(SyntaxError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to read from localStorage for key "${TEST_STORAGE_KEY}":`,
        expect.any(SyntaxError)
      );

      consoleErrorSpy.mockRestore();
    });

    it("set() throws when localStorage.setItem fails and keeps the previously cached value", () => {
      const { result } = setup({ throwOnError: true });

      result.current.set(TEST_VALUE_1);

      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage quota exceeded");
        });

      expect(() => result.current.set(NEW_VALUE)).toThrow(
        "Storage quota exceeded"
      );
      expect(result.current.read()).toBe(TEST_VALUE_1);

      setItemSpy.mockRestore();
    });

    it("read() returns null without throwing when the key is missing", () => {
      const { result } = setup({ throwOnError: true });

      expect(result.current.read()).toBeNull();
    });
  });
});

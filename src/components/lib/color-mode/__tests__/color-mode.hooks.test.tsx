import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useColorMode, useColorModeValue } from "../color-mode.hooks";

const mockUseThemeReturn = {
  resolvedTheme: "light",
  forcedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
};

vi.mock("next-themes", () => ({
  useTheme: () => mockUseThemeReturn,
}));

const wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

beforeEach(() => {
  vi.clearAllMocks();

  mockUseThemeReturn.resolvedTheme = "light";
  mockUseThemeReturn.forcedTheme = undefined;
});

describe("useColorMode", () => {
  it("renders without throwing and returns a colorMode that is light", () => {
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.colorMode).toBe("light");
  });

  it("toggleColorMode switches the colorMode to the dark when it is light", async () => {
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.colorMode).toBe("light");
    result.current.toggleColorMode();
    expect(mockUseThemeReturn.setTheme).toHaveBeenCalledWith("dark");
  });

  it("toggleColorMode switches the colorMode to the light when it is dark", async () => {
    mockUseThemeReturn.resolvedTheme = "dark";

    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.colorMode).toBe("dark");
    result.current.toggleColorMode();
    expect(mockUseThemeReturn.setTheme).toHaveBeenCalledWith("light");
  });

  it("uses forcedTheme when it is not undefined", () => {
    mockUseThemeReturn.forcedTheme = "forced-theme";

    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.colorMode).toBe("forced-theme");
  });
});

describe("useColorModeValue", () => {
  it("returns the light value when colorMode is light", () => {
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.colorMode).toBe("light");

    const { result: valueResult } = renderHook(
      () => useColorModeValue("light-value", "dark-value"),
      { wrapper }
    );

    expect(valueResult.current).toBe("light-value");
  });

  it("returns the dark value when colorMode is dark", async () => {
    mockUseThemeReturn.resolvedTheme = "dark";

    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.colorMode).toBe("dark");

    const { result: valueResult } = renderHook(
      () => useColorModeValue("light-value", "dark-value"),
      { wrapper }
    );

    expect(valueResult.current).toBe("dark-value");
  });
});

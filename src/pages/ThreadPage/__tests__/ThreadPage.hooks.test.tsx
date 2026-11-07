import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { useNavigateToDashboard } from "../ThreadPage.hooks";

const THREAD_PAGE_PATH = "/threads/test-thread";
const DASHBOARD_PATH = "/";

const ThreadPageRouterWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MemoryRouter initialEntries={[THREAD_PAGE_PATH]}>{children}</MemoryRouter>
  );
};

const setupNavigateToDashboard = () => {
  return renderHook(
    () => {
      return {
        navigateToDashboard: useNavigateToDashboard(),
        location: useLocation(),
      };
    },
    { wrapper: ThreadPageRouterWrapper }
  );
};

describe("ThreadPage hooks", () => {
  describe("useNavigateToDashboard", () => {
    it("navigates from the thread page to the dashboard", () => {
      const { result } = setupNavigateToDashboard();

      expect(result.current.location.pathname).toBe(THREAD_PAGE_PATH);

      act(() => {
        result.current.navigateToDashboard();
      });

      expect(result.current.location.pathname).toBe(DASHBOARD_PATH);
    });
  });
});

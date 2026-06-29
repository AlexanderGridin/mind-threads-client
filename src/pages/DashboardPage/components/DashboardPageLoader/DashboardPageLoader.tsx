import type { ReactNode } from "react";
import { useState } from "react";
import { mockThreads } from "@/__mocks__/threads";
import { ThreadListMode } from "../../DashboardPage.constants";
import type { ThreadListModeType } from "../../DashboardPage.types";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";

export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
  const [threadListMode, setThreadListMode] = useState<ThreadListModeType>(
    ThreadListMode.Grid
  );

  const toggleThreadListMode = () => {
    setThreadListMode((current) =>
      current === ThreadListMode.Grid
        ? ThreadListMode.List
        : ThreadListMode.Grid
    );
  };

  return (
    <DashboardPageActionContext.Provider value={{ toggleThreadListMode }}>
      <DashboardPageValueContext.Provider
        value={{ threadListMode, threads: mockThreads }}
      >
        {children}
      </DashboardPageValueContext.Provider>
    </DashboardPageActionContext.Provider>
  );
};

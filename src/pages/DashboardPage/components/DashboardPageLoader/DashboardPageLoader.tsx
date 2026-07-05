import type { ReactNode } from "react";
import { useState } from "react";
import { mockThreads } from "@/__mocks__/threads";
import { useLocalStorage } from "@/hooks";
import { ThreadListMode } from "../../DashboardPage.constants";
import type { ThreadListModeType } from "../../DashboardPage.types";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";
import { THREAD_LIST_MODE_STORAGE_KEY } from "./DashboardPageLoader.constants";

export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
  const threadListModeStorage = useLocalStorage<ThreadListModeType>(
    THREAD_LIST_MODE_STORAGE_KEY
  );

  const [threadListMode, setThreadListMode] = useState<ThreadListModeType>(
    () => {
      const storedThreadListMode = threadListModeStorage.read();

      if (storedThreadListMode === null) {
        const initialMode = ThreadListMode.Grid;
        threadListModeStorage.set(initialMode);

        return initialMode;
      }

      return storedThreadListMode;
    }
  );

  const toggleThreadListMode = () => {
    setThreadListMode((current) => {
      const newThreadListMode =
        current === ThreadListMode.Grid
          ? ThreadListMode.List
          : ThreadListMode.Grid;

      threadListModeStorage.set(newThreadListMode);

      return newThreadListMode;
    });
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

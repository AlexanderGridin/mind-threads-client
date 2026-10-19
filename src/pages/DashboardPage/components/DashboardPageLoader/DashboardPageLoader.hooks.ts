import { useContext, useEffect, useState } from "react";
import { checkContext } from "@/utils";
import { useThreadsService } from "@/services";
import type { MindThread, NewMindThread } from "@/types";
import { ThreadsStatus } from "../../DashboardPage.constants";
import type { ThreadsStatusType } from "../../DashboardPage.types";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";

export const useDashboardPageValue = () => {
  const context = useContext(DashboardPageValueContext);

  return checkContext(
    context,
    "DashboardPageValueContext",
    "useDashboardPageValue"
  );
};

export const useDashboardPageAction = () => {
  const context = useContext(DashboardPageActionContext);

  return checkContext(
    context,
    "DashboardPageActionContext",
    "useDashboardPageAction"
  );
};

export const useThreadsState = () => {
  const threadsService = useThreadsService();

  const [threads, setThreads] = useState<MindThread[]>([]);
  const [threadsStatus, setThreadsStatus] = useState<ThreadsStatusType>(
    ThreadsStatus.Loading
  );

  useEffect(() => {
    if (threadsStatus !== ThreadsStatus.Loading) return;

    let isActive = true;

    const loadThreads = async () => {
      try {
        const storedThreads = await threadsService.getThreads();

        if (!isActive) return;

        setThreads(storedThreads);
        setThreadsStatus(ThreadsStatus.Loaded);
      } catch {
        if (isActive) setThreadsStatus(ThreadsStatus.Error);
      }
    };

    loadThreads();

    return () => {
      isActive = false;
    };
  }, [threadsStatus, threadsService]);

  const addThread = async (newThread: NewMindThread) => {
    const createdThread = await threadsService.createThread(newThread);

    setThreads((currentThreads) => [createdThread, ...currentThreads]);

    return createdThread;
  };

  return { threads, threadsStatus, addThread };
};

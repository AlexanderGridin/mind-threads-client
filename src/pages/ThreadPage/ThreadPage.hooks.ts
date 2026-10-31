import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useThreadsService } from "@/services";
import { AppPath } from "@/routing/routing.constants";
import type { MindThread } from "@/types";
import { ThreadStatus } from "./ThreadPage.constants";
import type { ThreadStatusType } from "./ThreadPage.types";

export const useThreadState = (threadId: string) => {
  const threadsService = useThreadsService();

  const [thread, setThread] = useState<MindThread | null>(null);

  const [threadStatus, setThreadStatus] = useState<ThreadStatusType>(
    ThreadStatus.Loading
  );

  useEffect(() => {
    if (threadStatus !== ThreadStatus.Loading) {
      return;
    }

    let isActive = true;

    const loadThread = async () => {
      try {
        const storedThread = await threadsService.getThread(threadId);

        if (!isActive) {
          return;
        }

        setThread(storedThread);

        setThreadStatus(
          storedThread ? ThreadStatus.Loaded : ThreadStatus.NotFound
        );
      } catch {
        if (isActive) {
          setThreadStatus(ThreadStatus.Error);
        }
      }
    };

    loadThread();

    return () => {
      isActive = false;
    };
  }, [threadId, threadStatus, threadsService]);

  return { thread, threadStatus };
};

export const useNavigateToDashboard = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate(AppPath.Dashboard);
  };

  return navigateToDashboard;
};

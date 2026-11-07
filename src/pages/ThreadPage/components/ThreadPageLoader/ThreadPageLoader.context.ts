import { createContext } from "react";
import type {
  ThreadPageValue,
  ThreadPageAction,
} from "./ThreadPageLoader.types";

export const ThreadPageValueContext = createContext<ThreadPageValue | null>(
  null
);

export const ThreadPageActionContext = createContext<ThreadPageAction | null>(
  null
);

import { createContext } from "react";
import type {
  DashboardPageValue,
  DashboardPageAction,
} from "./DashboardPageLoader.types";

export const DashboardPageValueContext =
  createContext<DashboardPageValue | null>(null);

export const DashboardPageActionContext =
  createContext<DashboardPageAction | null>(null);

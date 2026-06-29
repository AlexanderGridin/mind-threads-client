import { useContext } from "react";
import { checkContext } from "@/utils";
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

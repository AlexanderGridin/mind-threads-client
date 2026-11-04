import { Routes, Route } from "react-router";
import { DashboardPage, ThreadPage, ColorsDemoPage } from "@/pages";
import { AppPath } from "@/routing/routing.constants";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={AppPath.Dashboard} element={<DashboardPage />} />
      <Route path={AppPath.Thread} element={<ThreadPage />} />
      <Route path={AppPath.ColorsDemo} element={<ColorsDemoPage />} />
    </Routes>
  );
};

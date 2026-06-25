import { Routes, Route } from "react-router";
import { DashboardPage, ThreadPage, ColorsDemoPage } from "@/pages";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="threads/:threadId" element={<ThreadPage />} />
      <Route path="colors-demo" element={<ColorsDemoPage />} />
    </Routes>
  );
};

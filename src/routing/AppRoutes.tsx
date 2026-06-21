import { Routes, Route } from "react-router";
import { HomePage, ThreadPage } from "@/pages";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="threads/:threadId" element={<ThreadPage />} />
    </Routes>
  );
};

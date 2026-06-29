import {
  DashboardHeader,
  DashboardPageLoader,
  DashboardContent,
} from "./components";

export const DashboardPage = () => {
  return (
    <DashboardPageLoader>
      <DashboardHeader />
      <DashboardContent />
    </DashboardPageLoader>
  );
};

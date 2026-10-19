import {
  DashboardHeader,
  DashboardPageLoader,
  DashboardContent,
  AddNewThreadModalContainer,
} from "./components";

export const DashboardPage = () => {
  return (
    <DashboardPageLoader>
      <DashboardHeader />
      <DashboardContent />
      <AddNewThreadModalContainer />
    </DashboardPageLoader>
  );
};

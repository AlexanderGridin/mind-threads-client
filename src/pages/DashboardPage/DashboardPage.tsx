import {
  DashboardHeader,
  DashboardPageLoader,
  DashboardContent,
  AddNewThreadModalContainer,
  DeleteThreadModalContainer,
} from "./components";

export const DashboardPage = () => {
  return (
    <DashboardPageLoader>
      <DashboardHeader />
      <DashboardContent />

      <AddNewThreadModalContainer />
      <DeleteThreadModalContainer />
    </DashboardPageLoader>
  );
};

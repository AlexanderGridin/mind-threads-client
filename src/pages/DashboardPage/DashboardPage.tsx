import {
  DashboardHeader,
  DashboardPageLoader,
  DashboardContent,
  AddNewThreadModalContainer,
  EditThreadModalContainer,
  DeleteThreadModalContainer,
} from "./components";

export const DashboardPage = () => {
  return (
    <DashboardPageLoader>
      <DashboardHeader />
      <DashboardContent />

      <AddNewThreadModalContainer />
      <EditThreadModalContainer />
      <DeleteThreadModalContainer />
    </DashboardPageLoader>
  );
};

import { useNavigate } from "react-router";
import { AppPath } from "@/routing/routing.constants";

export const useNavigateToDashboard = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate(AppPath.Dashboard);
  };

  return navigateToDashboard;
};

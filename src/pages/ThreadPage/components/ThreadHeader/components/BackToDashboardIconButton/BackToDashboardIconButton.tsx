import { LuArrowLeft } from "react-icons/lu";
import { IconButton } from "@/components/lib";
import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
import { useNavigateToDashboard } from "@/pages/ThreadPage/ThreadPage.hooks";
import { BackToDashboardIconButtonTestId } from "./BackToDashboardIconButton.constants";

export const BackToDashboardIconButton = () => {
  const navigateToDashboard = useNavigateToDashboard();

  return (
    <IconButton
      data-testid={BackToDashboardIconButtonTestId.container}
      aria-label={BACK_TO_DASHBOARD_LABEL}
      variant="ghost"
      color="fg"
      size="sm"
      onClick={navigateToDashboard}
    >
      <LuArrowLeft />
    </IconButton>
  );
};

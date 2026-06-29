import { Box } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { MindThreadCardTestId } from "../MindThreadCard.constants";

type CardColorIndicatorProps = {
  color: string;
  forMode: ThreadListModeType;
};

export const CardColorIndicator = ({
  color,
  forMode,
}: CardColorIndicatorProps) => {
  const forListMode = forMode === ThreadListMode.List;

  const width = forListMode ? "2" : "100%";
  const height = forListMode ? "auto" : "2";
  const flexShrink = forListMode ? 0 : undefined;

  const testId = forListMode
    ? MindThreadCardTestId.colorBorderLeft
    : MindThreadCardTestId.colorBorderTop;

  return (
    <Box
      data-testid={testId}
      width={width}
      height={height}
      backgroundColor={color}
      flexShrink={flexShrink}
    />
  );
};

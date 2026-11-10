import { Box } from "@/components/lib";
import { PAGE_TYPE_CONFIG } from "@/pages/ThreadPage/ThreadPage.constants";
import type { SectionPageType } from "@/types";
import { PageTypeIconTestId } from "./PageTypeIcon.constants";

type PageTypeIconProps = {
  type: SectionPageType;
};

export const PageTypeIcon = ({ type }: PageTypeIconProps) => {
  const { icon: TypeIcon } = PAGE_TYPE_CONFIG[type];

  return (
    <Box
      data-testid={PageTypeIconTestId[type]}
      as="span"
      display="flex"
      flexShrink={0}
    >
      <TypeIcon aria-hidden />
    </Box>
  );
};

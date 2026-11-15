import { LuEllipsisVertical } from "react-icons/lu";
import { Menu, type MenuItem } from "@/components/lib";
import type { SectionPage } from "@/types";
import {
  DELETE_PAGE_MENU_ITEM,
  PageCardActionsTestId,
} from "./PageCardActions.constants";
import { getPageActionsLabel } from "./PageCardActions.utils";

type PageCardActionsProps = {
  page: SectionPage;
  onDelete: (page: SectionPage) => void;
};

export const PageCardActions = ({ page, onDelete }: PageCardActionsProps) => {
  const handleDelete = () => {
    onDelete(page);
  };

  const menuItems: MenuItem[] = [
    { ...DELETE_PAGE_MENU_ITEM, color: "red", onSelect: handleDelete },
  ];

  return (
    <Menu
      triggerLabel={getPageActionsLabel(page.name)}
      triggerIcon={<LuEllipsisVertical />}
      data-testid={PageCardActionsTestId.menu}
      items={menuItems}
    />
  );
};

import { LuEllipsisVertical } from "react-icons/lu";
import { Menu, type MenuItem } from "@/components/lib";
import type { ThreadSection } from "@/types";
import {
  DELETE_SECTION_MENU_ITEM,
  SectionCardActionsTestId,
} from "./SectionCardActions.constants";
import { getSectionActionsLabel } from "./SectionCardActions.utils";

type SectionCardActionsProps = {
  section: ThreadSection;
  onDelete: (section: ThreadSection) => void;
};

export const SectionCardActions = ({
  section,
  onDelete,
}: SectionCardActionsProps) => {
  const handleDelete = () => {
    onDelete(section);
  };

  const menuItems: MenuItem[] = [
    { ...DELETE_SECTION_MENU_ITEM, color: "red", onSelect: handleDelete },
  ];

  return (
    <Menu
      triggerLabel={getSectionActionsLabel(section.name)}
      triggerIcon={<LuEllipsisVertical />}
      data-testid={SectionCardActionsTestId.menu}
      items={menuItems}
    />
  );
};

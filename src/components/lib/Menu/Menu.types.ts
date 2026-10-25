import type { ReactNode } from "react";

export type MenuItem = {
  value: string;
  label: string;
  color?: string;
  onSelect: () => void;
};

export type MenuProps = {
  triggerLabel: string;
  triggerIcon: ReactNode;
  items: MenuItem[];
  "data-testid"?: string;
};

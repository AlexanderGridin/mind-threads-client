import type { ReactNode } from "react";
import { DarkMode, LightMode } from "@/components/lib";
import { getContrastColorMode } from "@/utils";

type ThreadHeaderColorScopeProps = {
  backgroundColor?: string;
  children: ReactNode;
};

export const ThreadHeaderColorScope = ({
  backgroundColor,
  children,
}: ThreadHeaderColorScopeProps) => {
  if (!backgroundColor) {
    return children;
  }

  const colorMode = getContrastColorMode(backgroundColor);

  return colorMode === "light" ? (
    <LightMode>{children}</LightMode>
  ) : (
    <DarkMode>{children}</DarkMode>
  );
};

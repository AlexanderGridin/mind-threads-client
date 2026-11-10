import { useEffect, useRef } from "react";

export const useScrollIntoView = <ElementType extends HTMLElement>(
  shouldScroll: boolean
) => {
  const elementRef = useRef<ElementType>(null);

  useEffect(() => {
    if (shouldScroll) {
      elementRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [shouldScroll]);

  return elementRef;
};

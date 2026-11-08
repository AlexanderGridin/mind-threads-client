import { useEffect, useRef } from "react";
import { Box, TruncatedText } from "@/components/lib";
import type { ThreadSection } from "@/types";
import { SectionCardTestId } from "./SectionCard.constants";

type SectionCardProps = {
  section: ThreadSection;
  isLastCreated: boolean;
};

export const SectionCard = ({ section, isLastCreated }: SectionCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLastCreated) {
      cardRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isLastCreated]);

  return (
    <Box
      ref={cardRef}
      data-testid={SectionCardTestId.container}
      p="3"
      minWidth="0"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border"
      borderLeftWidth="4px"
      borderLeftColor={section.color}
      backgroundColor="bg"
    >
      <TruncatedText data-testid={SectionCardTestId.name} fontWeight="medium">
        {section.name}
      </TruncatedText>
    </Box>
  );
};

import { useRef, useState } from "react";
import { Text as ChakraText } from "@chakra-ui/react";
import { Tooltip } from "../Tooltip";
import { isTextTruncated } from "./TruncatedText.utils";
import { TruncatedTextTestId } from "./TruncatedText.constants";

export type TruncatedTextProps = {
  children: string;
  "data-testid"?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
};

export const TruncatedText = ({
  children,
  "data-testid": dataTestId,
  ...textProps
}: TruncatedTextProps) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handlePointerEnter = () => {
    setIsOverflowing(isTextTruncated(textRef.current));
  };

  return (
    <Tooltip
      label={children}
      disabled={!isOverflowing}
      contentTestId={TruncatedTextTestId.tooltip}
    >
      <ChakraText
        ref={textRef}
        data-testid={dataTestId ?? TruncatedTextTestId.text}
        truncate
        onPointerEnter={handlePointerEnter}
        {...textProps}
      >
        {children}
      </ChakraText>
    </Tooltip>
  );
};

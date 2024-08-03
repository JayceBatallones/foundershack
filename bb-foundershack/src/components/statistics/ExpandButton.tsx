import React, { useState } from "react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SquareChevronDown, SquareChevronUp } from "lucide-react";

type Props = {
  index: number;
};

const ExpandButton = (props: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const isExpanded = openIndex === props.index;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <CollapsibleTrigger>
            <span onClick={() => handleToggle(props.index)}>
              {isExpanded ? <SquareChevronUp /> : <SquareChevronDown />}
            </span>
          </CollapsibleTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {isExpanded ? (
            <p>Collapse further explanation</p>
          ) : (
            <p>Expand for further explanation</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExpandButton;

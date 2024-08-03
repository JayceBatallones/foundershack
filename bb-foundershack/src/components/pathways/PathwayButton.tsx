"use client";
import { BookOpen, Sparkles, Sparkle } from "lucide-react";
import React from "react";
import { redirect } from "next/navigation";


import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

type Node = {
  name: string;
  type: "skills" | "subTopics" | "topics";
  threshold: number;
  difficulty: string;
  year_level: string;
  index: number; // INDEX OF THE TOPIC WITHIN THE JSON
  isLocked: boolean;
  current: boolean;
  correctAnswers?: number;
};

type Props = {
  node: Node; // Accept a Node type prop
  index: number; // will be index of itself in the topic list
  nodeAmount: number;
};

const PathwayButton = ({ node, index, nodeAmount }: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;
  if (node.correctAnswers == undefined) {
    redirect("/");
  }
let percentage: number;
  if (node.correctAnswers === -1){
    percentage = 100
  }
  percentage = node.correctAnswers / node.threshold;

  let indentationLevel;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = indentationLevel * 40; // we can change 40

  const isFirst = index === 0;
  const isLast = index === nodeAmount - 1;

  const isCompleted = !node.current && !node.isLocked;
  const Icon = isCompleted ? BookOpen : isLast ? Sparkles : Sparkle;



  // Handle going into Quiz

  
  const router = useRouter()



  const onSubmit = async () => {
    router.push(`/pathways/loading/${node.type}/${node.name}`);
  };
  


  return (
    <Sheet>
      
        <div
          className="relative"
          style={{
            right: `${rightPosition}px`,
            marginTop: isFirst && !isCompleted ? 60 : 24,
          }}
        >
          {node["current"] ? (
            <div className="h-[102px] w-[102px] relative">
              <div
                className="absolute -top-6 left-2.5 px-3 py-2.5 border-2
            font-bold uppercase text-green-500 bg-white rounded-xl
            animate-bounce tracking-wide z-10"
              >
                Start
                <div
                  className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8
            border-x-transparent border-t-8 transform -translate-x-1/2"
                />
              </div>

              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: {
                    stroke: "#4ade80",
                  },
                  trail: {
                    stroke: "#e5e7eb",
                  },
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    size="rounded"
                    className="h-[70px] w-[70px] border-b-8"
                    variant={node.isLocked ? "locked" : "secondaryPathways"}
                  >
                    <Icon
                      className={cn(
                        "h-10 w-10",
                        node.isLocked
                          ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                          : "fill-primary-foreground text-primary-foreground",
                        isCompleted && "fill-none stroke-[4]"
                      )}
                    />
                  </Button>
                </SheetTrigger>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            <SheetTrigger asChild>

            <Button
              size="rounded"
              className="h-[70px] w-[70px] border-b-8"
              variant={node.isLocked ? "locked" : "secondaryPathways"}
            >
              <Icon
                className={cn(
                  "h-10 w-10",
                  node["isLocked"]
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                  isCompleted && "fill-none stroke-[4]"
                )}
              />
            </Button>
            </SheetTrigger>

          )}
        </div>

        <SheetContent style={{ maxWidth: '25vw' }}>
        <SheetHeader>
          <SheetTitle className="mt-4 text-4xl">{node.name}</SheetTitle>
          <SheetDescription className="text-xl">
          A parabola is a curve where each point of the curve is equidistant from a point called the focus and a straight line called the directrix. All parabolas have a focus and a directrix and every point of the parabola is equidistant from these.
          </SheetDescription>
          <SheetDescription className="text-xl text-black">
            Resources:
          </SheetDescription>
        </SheetHeader>
       
        <SheetFooter>
          <SheetClose asChild>
          <Button type="submit" disabled={node.isLocked}
          onClick={() => onSubmit()}
          >Start Quiz</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PathwayButton;

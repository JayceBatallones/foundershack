"use client";
import React from "react";
import axios from "axios";
import PathwayButton from "./PathwayButton";
import { checkCorrectAnswersSchema } from "@/schemas/pathway";
import { z } from "zod";

type Node = {
  name: string;
  type: "skills" | "subTopics" | "topics";
  threshold: number;
  difficulty: string;
  year_level: string;
  index: number;
  isLocked: boolean;
  current: boolean;
  correctAnswers?: number;
};
type TopicMap = Record<string, number>;

type Props = {
  initialNodes: Node[];
  currentTopicIndex: number;
  currentQuestionIndex: number;
  topicMap: TopicMap;
  userPathwayId: string;
  onLoadComplete: () => void; // New prop for callback
};

const PathwayButtonRenderer = ({
  initialNodes = [],
  currentTopicIndex,
  currentQuestionIndex,
  topicMap,
  userPathwayId,
  onLoadComplete,
}: Props) => {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchCorrectAnswers = async () => {
      const updatedNodes = [...nodes];
      try {
        for (let index = 0; index < nodes.length; index++) {
          const node = nodes[index];

          const payload: z.infer<typeof checkCorrectAnswersSchema> = {
            type: node.type,
            name: node.name,
            threshold: node.threshold,
            nodeAmount: nodes.length,
            topicMap: topicMap,
            userPathwayId: userPathwayId,
            currentQuestionIndex: currentQuestionIndex,
            currentTopicIndex:currentTopicIndex

          };

          let isLocked = true;
          let current = false;

          if (
            node.index === currentTopicIndex &&
            index === currentQuestionIndex
          ) {
            // Backend Example 3: API call
            const response = await axios.post(
              `/api/checkCorrectAnswers`,
              payload
            );

            currentTopicIndex = response.data.currentTopicIndex;
            currentQuestionIndex = response.data.currentNodeIndex;

            if (node.index < currentTopicIndex) {
              isLocked = false;
            } else if (node.index === currentTopicIndex) {
              if (index > currentQuestionIndex) {
                isLocked = true;
              } else {
                isLocked = false;
                if (currentQuestionIndex === index) {
                  current = true;
                }
              }
            }

            updatedNodes[index] = {
              ...node,
              correctAnswers: response.data.correctAnswerCount,
              isLocked: isLocked,
              current: current,
            };
          } else {
            if (node.index < currentTopicIndex) {
              isLocked = false;
            } else if (node.index === currentTopicIndex) {
              if (index > currentQuestionIndex) {
                isLocked = true;
              } else {
                isLocked = false;
                if (currentQuestionIndex === index) {
                  current = true;
                }
              }
            }

            updatedNodes[index] = {
              ...node,
              correctAnswers: -1,
              isLocked: isLocked,
              current: current,
            };
          }
        }

        setNodes(updatedNodes);
      } catch (error) {
        console.error("Error fetching correct answers:", error);
      } finally {
        setLoading(false);
        onLoadComplete(); // Notify parent component that loading is complete
      }
    };

    fetchCorrectAnswers();
  }, []);

  return (
    <div className="flex items-center justify-center flex-col relative">
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        nodes.map((node, index) => (
          <PathwayButton
            key={index}
            index={index}
            node={node}
            nodeAmount={nodes.length}
          />
        ))
      )}
    </div>
  );
};

export default PathwayButtonRenderer;

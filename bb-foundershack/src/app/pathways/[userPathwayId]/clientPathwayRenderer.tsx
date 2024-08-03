"use client";

import React, { useState } from "react";
import PathwayBanner from "@/components/pathways/PathwayBanner";
import PathwayButtonRenderer from "@/components/pathways/PathwayButtonRenderer";
import axios from "axios";
import { getCurrentNodeSchema } from "@/schemas/pathway";
import z from "zod";

type pathwayInformation = {
  name: string;
  type: string;
  threshold: number;
  difficulty: string;
  year_level: string;
  index: number;
};

type PathwayData = Record<number, (pathwayInformation & { index: number })[]>;

type TopicMap = Record<string, number>;

type Props = {
  updatedData: PathwayData;
  currentTopicIndex: number;
  currentQuestionIndex: number;
  topicMap: TopicMap;
  userPathwayId: string;
};

const ClientPathwayRenderer = ({
  updatedData,
  currentTopicIndex: initialTopicIndex,
  currentQuestionIndex: initialQuestionIndex,
  topicMap,
  userPathwayId,
}: Props) => {
  const [currentRendererIndex, setCurrentRendererIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(initialTopicIndex);
  const [currentQuetionIndex, setCurrentQuetionIndex] = useState(initialQuestionIndex);

  const handleRendererLoadComplete = async () => {
    
    const payload: z.infer<typeof getCurrentNodeSchema> = {
      userPathwayId: userPathwayId,
    };
    try {
      const response = await axios.post(`/api/getCurrentNode`, payload);
      const newTopicIndex = topicMap[response.data.currentNode["topic"]];
      const newQuestionIndex = response.data.currentNode["index"];

      setCurrentTopicIndex(newTopicIndex);
      setCurrentQuetionIndex(newQuestionIndex);
    } catch (error) {
      console.log(error);
    }

    setCurrentRendererIndex(currentRendererIndex + 1);
  };

  return (
    <div>
      {Object.entries(updatedData).map(([key, values], index) => (
        <div key={key}>
          {index <= currentRendererIndex && (
            <>
              <PathwayBanner title={key} description={`${values.length} items`} />
              <div>
                <PathwayButtonRenderer
                  initialNodes={values as Array<any>}
                  currentTopicIndex={currentTopicIndex}
                  currentQuestionIndex={currentQuetionIndex}
                  topicMap={topicMap}
                  userPathwayId={userPathwayId}
                  onLoadComplete={handleRendererLoadComplete} // Pass the callback
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClientPathwayRenderer;

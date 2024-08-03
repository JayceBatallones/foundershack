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

 

  return (
    <div>
      {Object.entries(updatedData).map(([key, values], index) => (
        <div key={key}>
          {index <= currentRendererIndex && (
            <>
              <PathwayBanner title={key} description={`${values.length} items`} />
              <div>
                test
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClientPathwayRenderer;

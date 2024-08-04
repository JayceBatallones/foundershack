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

/**
 * ClientPathwayRenderer component renders pathway data and handles navigation between topics and questions.
 *
 * @param {Props} props - Component props including updated pathway data, current indices, topic mapping, and user pathway ID.
 * @returns {JSX.Element} - The rendered pathway components.
 */
const ClientPathwayRenderer = ({
  updatedData,
  currentTopicIndex: initialTopicIndex,
  currentQuestionIndex: initialQuestionIndex,
  topicMap,
  userPathwayId,
}: Props) => {
  // State variables for managing the current renderer index, topic index, and question index
  const [currentRendererIndex, setCurrentRendererIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(initialTopicIndex);
  const [currentQuetionIndex, setCurrentQuetionIndex] =
    useState(initialQuestionIndex);

  /**
   * Handles the completion of rendering, updates the current topic and question indices from the server.
   */
  const handleRendererLoadComplete = async () => {
    const payload: z.infer<typeof getCurrentNodeSchema> = {
      userPathwayId: userPathwayId,
    };

    try {
      // Fetch the current node data from the server
      const response = await axios.post(`/api/getCurrentNode`, payload);
      const newTopicIndex = topicMap[response.data.currentNode["topic"]];
      const newQuestionIndex = response.data.currentNode["index"];

      // Update state with the new topic and question indices
      setCurrentTopicIndex(newTopicIndex);
      setCurrentQuetionIndex(newQuestionIndex);
    } catch (error) {
      console.log(error);
    }

    // Increment the renderer index to show the next set of pathway data
    setCurrentRendererIndex(currentRendererIndex + 1);
  };

  return (
    <div>
      {Object.entries(updatedData).map(([key, values], index) => (
        <div key={key}>
          {/* Render the pathway banner and button renderer if the index is less than or equal to the current renderer index */}
          {index <= currentRendererIndex && (
            <>
              <PathwayBanner
                title={key}
                description={`${values.length} items`}
              />
              <div>
                <PathwayButtonRenderer
                  initialNodes={values as Array<any>}
                  currentTopicIndex={currentTopicIndex}
                  currentQuestionIndex={currentQuetionIndex}
                  topicMap={topicMap}
                  userPathwayId={userPathwayId}
                  onLoadComplete={handleRendererLoadComplete} // Pass the callback to handle completion
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

import PathwayBanner from "@/components/pathways/PathwayBanner";
import { prisma } from "@/lib/db";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ClientPathwayRenderer from "./clientPathwayRenderer";
import { Prisma } from "@prisma/client";

interface PathwayData {
  [key: string]: Prisma.JsonArray[];
}

type pathwayInformation = {
  name: string;
  type: string;
  threshold: number;
  difficulty: string;
  year_level: string;
};

type Props = {
  params: {
    userPathwayId: string;
  };
};

/**
 * LearningPathway component fetches and renders the pathway data for the user.
 *
 * @param {Props} props - Component props including userPathwayId.
 * @returns {JSX.Element} - The rendered ClientPathwayRenderer component.
 */
const LearningPathway = async ({ params: { userPathwayId } }: Props) => {
  // Authenticate the user
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch user pathways from the database
  const userPathways = await prisma.userPathways.findUnique({
    where: {
      userPathwayId: userPathwayId,
    },
  });

  if (!userPathways) {
    redirect("/");
  }

  // Fetch pathway data based on the userPathway's pathwayId
  const pathway = await prisma.pathways.findUnique({
    where: {
      pathwayId: userPathways.pathwayId,
    },
  });

  if (!pathway) {
    redirect("/");
  }

  // Extract pathway nodes and cast to PathwayData
  const pathwayNodes = pathway.nodes;
  const data = pathwayNodes as PathwayData;

  // Create a map of topic names to their indices
  const dataKeysWithIndex = Object.keys(data).map((key, index) => ({
    key,
    index,
  }));
  const topicMap = dataKeysWithIndex.reduce((acc, { key, index }) => {
    acc[key] = index;
    return acc;
  }, {} as Record<string, number>);

  // Get current node details
  const currentNode = userPathways.currentNode as {
    topic: string;
    index: number;
  };
  const currentTopic = currentNode["topic"];
  const currentQuestionIndex = currentNode["index"];
  const currentTopicIndex = topicMap[currentTopic];

  // Transform data for rendering
  const updatedData = Object.entries(data).reduce((acc, [topic, subTopics]) => {
    if (topicMap.hasOwnProperty(topic)) {
      const index = topicMap[topic];
      acc[topic] = subTopics.map((subTopic) => ({
        ...subTopic,
        index,
      }));
    }
    return acc;
  }, {} as Record<number, (pathwayInformation & { index: number })[]>);

  // Render the ClientPathwayRenderer component
  return (
    <ClientPathwayRenderer
      updatedData={updatedData}
      currentTopicIndex={currentTopicIndex}
      currentQuestionIndex={currentQuestionIndex}
      topicMap={topicMap}
      userPathwayId={userPathwayId}
    />
  );
};

export default LearningPathway;

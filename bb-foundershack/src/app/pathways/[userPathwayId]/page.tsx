
import PathwayBanner from "@/components/pathways/PathwayBanner";
import { prisma } from "@/lib/db";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ClientPathwayRenderer from "./clientPathwayRenderer"
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

const LearningPathway = async ({ params: { userPathwayId } }: Props) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const userPathways = await prisma.userPathways.findUnique({
    where: {
      userPathwayId: userPathwayId,
    },
  });

  if (!userPathways) {
    redirect("/");
  }

  const pathway = await prisma.pathways.findUnique({
    where: {
      pathwayId: userPathways.pathwayId,
    },
  });

  if (!pathway) {
    redirect("/");
  }

  const pathwayNodes = pathway.nodes;
  const data = pathwayNodes as PathwayData;

  const dataKeysWithIndex = Object.keys(data).map((key, index) => ({ key, index }));
  const topicMap = dataKeysWithIndex.reduce((acc, { key, index }) => {
    acc[key] = index;
    return acc;
  }, {} as Record<string, number>);

  const currentNode = userPathways.currentNode as { topic: string, index: number };
  const currentTopic = currentNode["topic"];
  const currentQuestionIndex = currentNode["index"];
  const currentTopicIndex = topicMap[currentTopic];

  const updatedData = Object.entries(data).reduce((acc, [topic, subTopics]) => {
    if (topicMap.hasOwnProperty(topic)) {
      const index = topicMap[topic];
      acc[topic] = subTopics.map(subTopic => ({
        ...subTopic,
        index,
      }));
    }
    return acc;
  }, {} as Record<number, (pathwayInformation & { index: number })[]>);

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

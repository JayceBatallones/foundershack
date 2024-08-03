"use client";
import React from "react";
import { Prisma } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  statistics: {
    statisticsID: string;
    attemptId: string;
    percentage: number;
    topics: Prisma.JsonValue | null;
    timeTaken: Date;
    subTopics: Prisma.JsonValue | null;
  };
};

const StatisticsGraphs = ({ statistics }: Props) => {
  return (
    <Tabs defaultValue="topics">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="topics">Topics</TabsTrigger>
        <TabsTrigger value="subTopics">Sub Topics</TabsTrigger>
      </TabsList>
      <TabsContent value="topics"></TabsContent>
      <TabsContent value="subTopics"></TabsContent>
    </Tabs>
  );
};

export default StatisticsGraphs;

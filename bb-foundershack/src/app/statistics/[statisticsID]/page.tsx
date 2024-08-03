import { prisma } from "@/lib/db";
import React from "react";
import { LucideLayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";
import ResultsCard from "@/components/statistics/ResultsCard";
import AccuracyCard from "@/components/statistics/AccuracyCard";
import TimeTakenCard from "@/components/statistics/TimeTakenCard";
import StatisticsGraph from "@/components/statistics/StatisticsGraphs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  params: {
    statisticsID: string;
  };
};

const StatisticsPage = async ({ params: { statisticsID } }: Props) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  if (!statisticsID) {
    return redirect("/quiz");
  }

  const statistics = await prisma.statistics.findUnique({
    where: { statisticsID: statisticsID },
  });
  if (!statistics) {
    return redirect("/quiz");
  }

  // We need to get the questions to display question list

  const attempt = await prisma.attempt.findUnique({
    where: { attemptId: statistics.attemptId },
    select: {
      quizId: true,
      answers: true,
    },
  });

  if (!attempt) {
    return redirect("/quiz");
  }

  const questionIds = await prisma.testQuestionToQuiz.findMany({
    where: {
      QuizID: attempt.quizId,
    },
    select: {
      QuestionID: true,
    },
  });

  // Change to idList so i can query it
  const questionIdList = questionIds.map((q) => q.QuestionID);

  const questions = await prisma.testQuestion.findMany({
    where: {
      QuestionID: { in: questionIdList },
    },
    select: {
      QuestionID: true,
      Description: true,
      Explanation: true,
      CorrectAnswer: true,
      Choices: true,
    },
  });

  return (
    <>
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className={buttonVariants()}>
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultsCard accuracy={statistics.percentage} />
          <AccuracyCard accuracy={statistics.percentage} />
          <TimeTakenCard timeTaken={statistics.timeTaken} />
        </div>
        <Tabs defaultValue="stats" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="questions">Question List</TabsTrigger>
          </TabsList>
          <TabsContent value="stats">
            <StatisticsGraph statistics={statistics} />
          </TabsContent>
          <TabsContent value="questions"></TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StatisticsPage;

"use client";
import React from "react";
import { Prisma } from "@prisma/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

type TopicChartData = {
  topic: string;
  percentageCorrect: number;
};


const TopicGraph = ({ statistics }: Props) => {
  let topicChartData: TopicChartData[] = [];


  if (statistics.topics != null) {
    topicChartData = Object.entries(statistics.topics).map(([topic, data]) => {
      const percentageCorrect =
        data.correctAnswerCount / data.questionAppearanceCount;
      return {
        topic,
        percentageCorrect,
      };
    });
  }

  const chartConfig = {
    percentageCorrect: {
      label: "Percentage Correct",
      color: "hsl(var(--chart-1))",
    },
    label: {
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  console.log(topicChartData)

  return (

    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Topics Percentage Correct</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={topicChartData}
            layout="vertical"
            margin={{
              left: 40,
            }}
          >
            <CartesianGrid horizontal={false} />

            <YAxis
              dataKey="topic"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <XAxis dataKey="percentageCorrect" type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}>

                
              </ChartTooltip>
            <Bar
              dataKey="percentageCorrect"
              fill="var(--color-percentageCorrect)"
              radius={4}
              layout="vertical"
            >
              <LabelList
                dataKey="percentageCorrect"
                position="right"
                offset={8}
                formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>

  );
};

export default TopicGraph;

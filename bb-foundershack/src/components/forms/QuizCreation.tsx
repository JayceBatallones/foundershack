"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../foundershack/bb-foundershack/src/components/ui/card";
import { Button } from "../ui/button";
import axios, { AxiosError } from "axios";
import LoadingQuestions from "../LoadingQuestions";

type Quiz = {
  quizId: number;
  name: string;
  duration: number;
  maxScore: number;
};

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";

type QuizCreationProps = {
  quizList: Quiz[];
};

const QuizCreation: React.FC<QuizCreationProps> = ({ quizList }) => {
  const router = useRouter();

  const gridColumns = [
    "grid-cols-1",
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    "xl:grid-cols-5",
  ];

  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const { toast } = useToast();

//   to get right amount of grid cols to fit on the screen (centers if theres less than 5)
  // can change this to sm, md, lg later
const getGridColsClass = (numItems: number) => {
    if (numItems >= 5) return gridColumns.join(" ");
    return gridColumns.slice(0, numItems).join(" ");
  };

  const { mutate: createAttempt, isLoading } = useMutation({
    mutationFn: async (quizId: number) => {
      const response = await axios.post("/api/game", { quizId });
      return response.data;
    },
  });

  const onSubmit = async (quizId: number) => {
    setShowLoader(true);
    createAttempt(quizId, {
      onError: (error) => {
        setShowLoader(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 500) {
            toast({
              title: "Error",
              description: "Something went wrong. Please try again later.",
              variant: "destructive",
            });
          }
        }
      },
      onSuccess: ({ attemptId }: { attemptId: string }) => {

        setFinishedLoading(true);
        setTimeout(() => {
          router.push(`play/mcq/${attemptId}`)
        }, 2000);
      },
    });
  };

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading}/>
  }
  
  

  return (
    <div className="flex justify-center items-center h-[calc(100vh-56px)]">
      <div
        className={`grid gap-6 p-4 ${getGridColsClass(quizList.length)}`}
        style={{ justifyItems: 'center' }}
      >
        {quizList.map((quiz) => (
          <Card
            key={quiz.quizId}
            className="w-[260px] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus-within:scale-[1.02] focus-within:shadow-md"
          >
            <CardHeader className="mb-auto">
              <CardTitle className="text-wrap text-xl font-bold">
                {quiz.name}
              </CardTitle>
              <CardDescription>Duration: {quiz.duration} minutes</CardDescription>
              <CardDescription>Questions: {quiz.maxScore} questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
              disabled={isLoading}
              onClick={() => onSubmit(quiz.quizId)}>Start</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizCreation;

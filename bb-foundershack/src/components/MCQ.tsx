"use client";
import React from "react";
import { Attempt, Prisma } from "@prisma/client";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import { cn, formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";

import { MathJaxHtml } from "mathjax3-react";
import axios from "axios";
import { z } from "zod";
import { addAnswerSchema } from "@/schemas/quiz";
import { useMutation } from "@tanstack/react-query";
import { statsSchema } from "@/schemas/stats";
import { useRouter } from "next/navigation";

type Props = {
  attempt: Attempt;
  testQuestion: {
    QuestionID: string;
    Description: string | null;
    Explanation: string | null;
    CorrectAnswer: string | null;
    Choices: Prisma.JsonValue;
    Subject: string | null;
    Topic: string | null;
    SubTopic: string | null;
}[];
};
type Choice = {
  Image: string;
  Description: string;
};

const MCQ = ({ attempt, testQuestion }: Props) => {
  const router = useRouter();

  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [selectedChoice, setSelectedChoice] = React.useState<number>(0);
  const [descriptionType, setDescriptionType] = React.useState("");
  const [hasEnded, setHasEnded] = React.useState(false);
  const [statistics, setStatistics] = React.useState("");


  // Recalculate something but we dont want to rerender useMemo
  // Like a useEffect but ensuring it doesn't rerender
  const currentQuestion = React.useMemo(() => {
    return testQuestion[questionIndex];
  }, [questionIndex, testQuestion]);

  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.Choices) return [];

    const choices = currentQuestion.Choices as Record<string, Choice>;

    // Assuming you want to unpack descriptions or images that are not empty
    const unpackedChoices: string[] = Object.values(choices)
      .filter((choice) => choice.Description || choice.Image)
      .map((choice) => choice.Description || choice.Image);

    if (unpackedChoices[0]?.startsWith("https")) {
      setDescriptionType("image");
    } else {
      setDescriptionType("string");
    }
    return unpackedChoices;
  }, [currentQuestion]);

  const { mutate: saveAnswer, isLoading: isChecking } = useMutation({
    mutationFn: async () => {
      const userLetter = String.fromCharCode(65 + selectedChoice); // Convert index to letter (0 -> A, 1 -> B, etc.)

      const payload: z.infer<typeof addAnswerSchema> = {
        attemptId: attempt.attemptId,
        userAnswer: userLetter,
      };

      // Backend Example 1: API call
      const response = await axios.post(`/api/saveAnswer`, payload);
      return response.data;
    },
  });

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof statsSchema> = {
        attemptId: attempt.attemptId,
        testQuestions: testQuestion,
        timeEnded: new Date(now)
      };

      // Backend Example 2: API call
      const response = await axios.post(`/api/stats`, payload);
      setStatistics(response.data.statisiticsID)
      return response.data;
    },
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasEnded]);

// Function will reinstantiate everytime dependencies [] are channged
  const handleNextButton = React.useCallback(() => { 

    saveAnswer(undefined ,{
      onSuccess: () =>{

        if (questionIndex === testQuestion.length - 1) {
          // We have to make a new post to create statistics page!
          endGame();
          setHasEnded(true);
          return;
        }
        setQuestionIndex((questionIndex) => questionIndex + 1);
      }
    })


  }, [saveAnswer, questionIndex, testQuestion.length, endGame]); 


    // handleStatisticsButton
    const handleStatisticsButton = React.useCallback(() => {
      if (statistics) {
        router.push(`/statistics/${statistics}`);
      }
    }, [statistics, router]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "1") {
        setSelectedChoice(0);
      } else if (key === "2") {
        setSelectedChoice(1);
      } else if (key === "3") {
        setSelectedChoice(2);
      } else if (key === "4") {
        setSelectedChoice(3);
      } else if (key === "5") {
        setSelectedChoice(4);
      } else if (key === "Enter") {
        handleNextButton();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNextButton]);

  const [now, setNow] = React.useState(new Date());


  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You Completed in{" "}
          {formatTimeDelta(differenceInSeconds(now, attempt.timeStarted))}
        </div>
        <Button
        onClick={handleStatisticsButton}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between h-screen">
      <div className="ml-4 max-width-1/2 mr-4 max-w-4xl w-1/3 top-1/5 h-dvh">
        <div className="flex flex-row justify-between top-11 sticky">
          <div className="flex flex-col ">
            {/* topic comment
            <p>
              <span className="text-slate-400">Topic</span> &nbsp;
              <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
                TODO Change this
                topic
              </span>
            </p> */}

            <div className="flex self-start mt-3 text-slate-400">
              <Timer className="mr-2" />
              {formatTimeDelta(differenceInSeconds(now, attempt.timeStarted))}
            </div>
          </div>
          {/* Adds a counter of right and wrong which we dont want currently */}
          {/* <MCQCounter /> */}
        </div>
        {/* Question Description Card */}
        <Card className="w-full mt-4 top-20 sticky">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
              <div>{questionIndex + 1}</div>
              <div className="text-base text-slate-400">
                {testQuestion.length}
              </div>
            </CardTitle>
            <CardDescription className="flex-grow text-lg">
              {currentQuestion.Description && (
                <MathJaxHtml html={currentQuestion.Description} />

              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mr-4 grow">
        {/* Options */}
        {/* If images */}
        {descriptionType === "image" && (
          <div className="grid gap-8 grid-cols-3 mt-4">
            {options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // Convert index to letter (0 -> A, 1 -> B, etc.)
              return (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedChoice(index);
                  }}
                >
                  <Card
                    key={index}
                    className={`transition-colors duration-200 ${
                      selectedChoice === index ? "bg-black" : "bg-secondary"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`p-2 px-3 border rounded-md ${
                          selectedChoice === index ? "text-white" : "text-black"
                        }`}
                      >
                        {letter}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={option} // Ensure you're accessing the image property
                        alt={`Option ${letter}`}
                        className="object-cover w-full" // Adjust dimensions as needed
                      />
                    </CardContent>
                  </Card>
                </button>
              );
            })}
            <Button
              onClick={() => {
                handleNextButton();
              }}
            >
              {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
        {/* If text */}
        {descriptionType === "string" && (
          <div className="flex flex-col item-center justify-center w-full mt-4">
            {options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // Convert index to letter (0 -> A, 1 -> B, etc.)

              return (
                <Button
                  key={option}
                  className="justify-start w-full py-8 mb-4"
                  variant={selectedChoice === index ? "default" : "secondary"}
                  onClick={() => {
                    setSelectedChoice(index);
                  }}
                >
                  <div className="flex items-center justify-start">
                    <div className="p-2 px-3 mr-5 border rounded-md">
                      {letter}
                    </div>
                    <div className="text-start">
                      {option && (
                        <MathJaxHtml html={option} />

                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
            <Button
              disabled={isChecking}
              onClick={() => {
                handleNextButton();
              }}
            >
              {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQ;

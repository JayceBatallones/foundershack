import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    attemptId: string;
  };
};

/**
 * MCQPage component fetches and displays multiple-choice questions (MCQs) for a specific attempt.
 *
 * @param {Props} props - Contains the attemptId to fetch and display the MCQs.
 * @returns {JSX.Element} - The rendered MCQ component with the attempt and questions data.
 */
const MCQPage = async ({ params: { attemptId } }: Props) => {
  // Authenticate the user
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch the attempt details from the database
  const attempt = await prisma.attempt.findUnique({
    where: {
      attemptId: attemptId,
    },
  });
  if (!attempt) {
    return redirect("/quiz");
  }

  // Redirect if the attempt is not found
  if (!attempt) {
    console.error("Attempt cannot be found!");
    return redirect("/quiz");
  }

  // Fetch the question IDs associated with the quiz of the attempt
  const questionIds = await prisma.testQuestionToQuiz.findMany({
    where: {
      QuizID: attempt.quizId,
    },
    select: {
      QuestionID: true,
    },
  });

  // Map question IDs to a list for querying
  const questionIdList = questionIds.map((q) => q.QuestionID);

  // Fetch the details of the questions using the question ID list
  const questions = await prisma.testQuestion.findMany({
    where: {
      QuestionID: { in: questionIdList },
    },
    select: {
      QuestionID: true,
      Description: true,
      Explanation: true,
      Choices: true,
      CorrectAnswer: true,
      Subject: true,
      Topic: true,
      SubTopic: true,
    },
  });

  // Render the MCQ component with the attempt and questions data
  return <MCQ attempt={attempt} testQuestion={questions} />;
};

export default MCQPage;

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

const MCQPage = async ({ params: { attemptId } }: Props) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const attempt = await prisma.attempt.findUnique({
    where: {
      attemptId: attemptId,
    },
  });
  if (!attempt){
    return redirect("/quiz")
  }

  if (!attempt) {
    console.error("Attempt cannot be found!");
    return redirect("/quiz");
  }

  const questionIds = await prisma.testQuestionToQuiz.findMany({
    where: {
      QuizID: attempt.quizId,
    },select:{
      QuestionID: true
    }
  });

  // Change to idList so i can query it
  const questionIdList = questionIds.map(q => q.QuestionID);

  const questions = await prisma.testQuestion.findMany({
    where:{
      QuestionID: { in: questionIdList }
    },
    select:{
      QuestionID:true,
      Description:true,
      Explanation:true,
      Choices:true,
      CorrectAnswer:true,
      Subject:true,
      Topic:true,
      SubTopic:true
    }
  })


  return (
    <MCQ attempt={attempt} testQuestion={questions} />
  );
};

export default MCQPage;

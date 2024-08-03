import { prisma } from "@/lib/db";
import { createPathwayQuizSchema } from "@/schemas/pathways";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { v4 as uuid4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name } = createPathwayQuizSchema.parse(body);

    // 1. We need to find all of test questions which belong to this type and name
    let questionIds: any[] = [];

    if (type == "skills") {
      questionIds = await prisma.testQuestion.findMany({
        where: {
          Skill: name,
        },
        select: {
          QuestionID: true,
        },
      });
    } else if (type == "topics") {
      questionIds = await prisma.testQuestion.findMany({
        where: {
          Topic: name,
        },
        select: {
          QuestionID: true,
        },
      });
    } else if (type == "subTopics") {
      questionIds = await prisma.testQuestion.findMany({
        where: {
          SubTopic: name,
        },
        select: {
          QuestionID: true,
        },
      });
    }

    // Change to idList so i can for loop and add to quiz
    const questionIdList = questionIds.map(q => q.QuestionID);

    const id = uuid4();
    const quizName = `${type}-${id}-${name}`;

    // 2. We need to create a quiz instance
    const quiz = await prisma.quiz.create({
      data:{
          duration: -1,
          maxScore: questionIdList.length,
          name: quizName
      }
    });

    // 3. We need to link those test questions to that quiz instance
    if (!quiz) {
      return NextResponse.json({
          error: "Quiz could not be made"
      });
    }

    if (!questionIds){
      return NextResponse.json({
          error: "No questions exist for that query"
      });
    }

    // Link those test questions to that quiz instance
    const quizId = quiz.quizId; // assuming quizId is the primary key of the Quiz table
    const quizQuestionLinks = questionIdList.map(questionId => ({
      QuizToQuestionID: uuid4(),
      QuestionID: questionId,
      QuizID: quizId,
    }));

    await prisma.testQuestionToQuiz.createMany({
      data: quizQuestionLinks,
    });

    return NextResponse.json(
      {
        quizId: quizId,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues,
        },
        {
          status: 400,
        }
      );
    } else {
      return NextResponse.json(
        {
          error: "An unexpected error occurred",
        },
        {
          status: 500,
        }
      );
    }
  }
}

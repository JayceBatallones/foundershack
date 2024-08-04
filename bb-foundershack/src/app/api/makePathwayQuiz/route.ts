import { prisma } from "@/lib/db";
import { createPathwayQuizSchema } from "@/schemas/pathways";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { v4 as uuid4 } from "uuid";

/**
 * Handles the POST request to create a new quiz based on the provided type and name.
 *
 * @param {Request} req - The request object containing the type and name of the quiz.
 * @returns {Promise<NextResponse>} - The response object containing the quiz ID or an error message.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body and validate against the schema
    const body = await req.json();
    const { type, name } = createPathwayQuizSchema.parse(body);

    // Initialize an array to hold question IDs
    let questionIds: any[] = [];

    // Find all test questions based on the provided type and name
    if (type === "skills") {
      questionIds = await prisma.testQuestion.findMany({
        where: {
          Skill: name,
        },
        select: {
          QuestionID: true,
        },
      });
    } else if (type === "topics") {
      questionIds = await prisma.testQuestion.findMany({
        where: {
          Topic: name,
        },
        select: {
          QuestionID: true,
        },
      });
    } else if (type === "subTopics") {
      questionIds = await prisma.testQuestion.findMany({
        where: {
          SubTopic: name,
        },
        select: {
          QuestionID: true,
        },
      });
    }

    // Extract question IDs into a list
    const questionIdList = questionIds.map((q) => q.QuestionID);

    // Generate a unique ID and name for the quiz
    const id = uuid4();
    const quizName = `${type}-${id}-${name}`;

    // Create a new quiz instance
    const quiz = await prisma.quiz.create({
      data: {
        duration: -1,
        maxScore: questionIdList.length,
        name: quizName,
      },
    });

    // If quiz creation fails, return an error response
    if (!quiz) {
      return NextResponse.json({
        error: "Quiz could not be made",
      });
    }

    // If no questions are found, return an error response
    if (!questionIds) {
      return NextResponse.json({
        error: "No questions exist for that query",
      });
    }

    // Link test questions to the created quiz
    const quizId = quiz.quizId;
    const quizQuestionLinks = questionIdList.map((questionId) => ({
      QuizToQuestionID: uuid4(),
      QuestionID: questionId,
      QuizID: quizId,
    }));

    // Create many-to-many relationships between the quiz and its questions
    await prisma.testQuestionToQuiz.createMany({
      data: quizQuestionLinks,
    });

    // Return the quiz ID in the response
    return NextResponse.json(
      {
        quizId: quizId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // Handle validation errors
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
      // Handle unexpected errors
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

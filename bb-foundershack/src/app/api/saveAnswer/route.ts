import { prisma } from "@/lib/db";
import { addAnswerSchema } from "@/schemas/quiz";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Unpack question id, user answer and attempt id via schemas/quiz zod
    const { userAnswer, attemptId } = addAnswerSchema.parse(body);

    // Adding users answer to attempt
    await prisma.attempt.update({
      where: {
        attemptId: attemptId,
      },
      data: {
        answers: {
          push: userAnswer,
        },
      },
    });

    await prisma.attempt.update({
      where: { attemptId: attemptId },
      data: {currentQuestion: {increment: 1}}
    });

    return NextResponse.json(
      {
        response: true,
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
    }
  }
}

import { prisma } from "@/lib/db";
import { addAnswerSchema } from "@/schemas/quiz";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Backen Example 1: saveAnswer
/**
 * Handles the POST request to save a user's answer to an attempt.
 *
 * @param {Request} req - The request object containing the user's answer and attempt ID.
 * @returns {Promise<NextResponse>} - The response object indicating success or error.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body and validate against the schema
    const body = await req.json();

    // Unpack question id, user answer and attempt id via schemas/quiz zod
    const { userAnswer, attemptId } = addAnswerSchema.parse(body);

    // Update the attempt with the user's answer
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

    // Increment the current question index
    await prisma.attempt.update({
      where: { attemptId: attemptId },
      data: { currentQuestion: { increment: 1 } },
    });

    // Return success response
    return NextResponse.json(
      {
        response: true,
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
    }
    // Handle unexpected errors
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}

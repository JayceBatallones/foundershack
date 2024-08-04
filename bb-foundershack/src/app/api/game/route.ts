import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Handles the POST request to create a quiz attempt.
 *
 * @param {Request} req - The request object containing the quiz ID.
 * @returns {Promise<NextResponse>} - The response object indicating the outcome of the attempt creation.
 */
export async function POST(req: Request) {
  // Parse the request body to get the quiz ID
  const body = await req.json();
  const quizId = body.quizId;

  // Find the quiz based on the provided quiz ID
  const quiz = await prisma.quiz.findFirst({
    where: {
      quizId: quizId,
    },
  });

  // Retrieve the current user's ID from the authentication service
  let clerkUserId;
  try {
    const clerkUser = await currentUser();
    clerkUserId = clerkUser?.id; // Access the user ID from the user object
  } catch (error) {
    console.error("Error fetching current user:", error);
  }

  // Match the Clerk user ID to the user ID in the database
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        clerkId: clerkUserId,
      },
    });
  } catch (error) {
    console.error("Error finding user:", error);
  }

  if (user) {
    const userId = user.userId;

    // Ensure userId and quizId are defined before creating the attempt
    if (userId && quizId) {
      // Create a new attempt for the user on the specified quiz
      try {
        const attempt = await prisma.attempt.create({
          data: {
            userId: userId,
            quizId: quizId,
            currentQuestion: 0,
            isComplete: false,
            timeStarted: new Date(),
          },
        });

        // Return the newly created attempt ID
        return NextResponse.json(
          { attemptId: attempt.attemptId },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error creating attempt:", error);
      }
    } else {
      console.error("userId or quizId is undefined");
    }
  } else {
    console.error("User not found");
  }

  // Handle the case where the quiz is not found
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }
}

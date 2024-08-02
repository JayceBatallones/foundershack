import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
export async function POST(req: Request) {

  // So first we need to find the quiz and then generate an attempt with the quiz
  const body = await req.json();

  const quizId = body.quizId;
  const quiz = await prisma.quiz.findFirst({
    where: {
      quizId: quizId,
    },
  });

  // Create an attempt instance
  // 1. We need to get user ID
  let clerkUserId;
  try {
    const clerkUser = await currentUser();
    clerkUserId = clerkUser?.id; // Access the user ID from the user object
  } catch (error) {
    console.error("Error fetching current user:", error);
  }

  // 2. Match this clerk id to a user id
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

    // Ensure userId and quizId are defined before making the attempt
    if (userId && quizId) {
      // 3. Try to make attempt
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

   
        return NextResponse.json({ attemptId: attempt.attemptId },
          {status:200}
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

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }
}

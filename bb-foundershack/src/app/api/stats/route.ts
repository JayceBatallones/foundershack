import { statsSchema } from "@/schemas/stats";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { differenceInSeconds } from "date-fns";
import { formatTimeDelta } from "@/lib/utils";
import React from "react";

export async function POST(req: Request) {
  // TODO we will need to push timeCompleted into this so we can save it into attempt

  try {
    // imports will be attemptId and testQuestions[]

    // 1. Instantiate json and correct amount via let
    const body = await req.json();
    const { attemptId, testQuestions, timeEnded } = statsSchema.parse(body);

    // ensure attempt is updated as complete
    await prisma.attempt.update({
      where: {
        attemptId: attemptId,
      },
      data: {
        isComplete: true,
        timeEnded: timeEnded,
      },
    });

    let topics: {
      [key: string]: {
        correctAnswerCount: number;
        questionAppearanceCount: number;
      };
    } = {};
    let subTopics: {
      [key: string]: {
        correctAnswerCount: number;
        questionAppearanceCount: number;
      };
    } = {};
    let counter: number = 0;

    const attempt = await prisma.attempt.findUnique({
      where: {
        attemptId: attemptId,
      },
      select: {
        answers: true,
        timeStarted: true,
        timeEnded: true,
        userId: true,
      },
    });

    if (!attempt) {
      throw new Error(`Attempt with ID ${attemptId} not found.`);
    }

    // Update lastQuizDone & streak
    const userId = attempt.userId;
    const userInfo = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
      select: {
        streak: true,
        lastQuizDone: true,
      },
    });

    if (userInfo) {
      const streak = userInfo.streak;

      const today = new Date();
      const lastDate = userInfo.lastQuizDone;
      const numDaysBefore = Math.floor(
        (today.valueOf() - lastDate.valueOf()) / (24 * 60 * 60 * 1000)
      );

      if (numDaysBefore > 0) {
        await prisma.user.update({
          where: {
            userId: userId,
          },
          data: {
            streak: streak + 1,
            lastQuizDone: today,
          },
        });
      }
    }

    await prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        lastQuizDone: new Date(),
      },
    });

    // 2. Matching attempt answer to ground truth answer

    // 2.1 iterate correct amoun

    // 2.2 Alter json topics

    // Matching attempt answer to ground truth answer
    testQuestions.forEach((question, index) => {
      const attemptAnswer = attempt.answers[index];
      const correctAnswer = question.CorrectAnswer;

      const topic = String(question.Topic);
      const subTopic = String(question.SubTopic);

      // Process topics
      if (topic) {
        if (!topics[topic]) {
          topics[topic] = { correctAnswerCount: 0, questionAppearanceCount: 0 };
        }
        topics[topic].questionAppearanceCount++;
        if (attemptAnswer === correctAnswer) {
          counter++;
          topics[topic].correctAnswerCount++;
        }
      }

      // Process subtopics
      if (subTopic != "null") {
        if (subTopic) {
          if (!subTopics[subTopic]) {
            subTopics[subTopic] = {
              correctAnswerCount: 0,
              questionAppearanceCount: 0,
            };
          }
          subTopics[subTopic].questionAppearanceCount++;
          if (attemptAnswer === correctAnswer) {
            subTopics[subTopic].correctAnswerCount++;
          }
        }
      }
    });

    // 3. Calculate final percentage and time taken

    const percentage = Math.round((counter / testQuestions.length) * 100);
    let timeTakenSeconds;
    if (attempt.timeEnded) {
      timeTakenSeconds = differenceInSeconds(
        attempt.timeEnded,
        attempt.timeStarted
      );
    } else {
      const now = new Date();
      timeTakenSeconds = differenceInSeconds(now, attempt.timeStarted);
    }

    const baseDate = new Date(0);
    const timeTaken = new Date(baseDate.getTime() + timeTakenSeconds * 1000);
    // 4. Create Statistics Instance

    const statistics = await prisma.statistics.create({
      data: {
        timeTaken: timeTaken,
        attemptId: attemptId,
        percentage: percentage,
        topics: topics,
        subTopics: subTopics,
      },
    });

    if (!statistics) {
      console.log("Statistics was not made!");
      throw new Error(`Statistics could not be created`);
    }
    // 5. Return Statisitcs Instance
    return NextResponse.json(
      {
        statisiticsID: statistics.statisticsID,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error);
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

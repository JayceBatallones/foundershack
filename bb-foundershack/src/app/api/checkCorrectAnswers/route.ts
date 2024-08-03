import { auth } from "@clerk/nextjs/server";
import { checkCorrectAnswersSchema } from "@/schemas/pathways";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";


interface answerData {
  [key: string]: {
    correctAnswerCount: number;
  questionAppearanceCount: number;
  }
}

// Function to find the key by its numeric value
const findKeyByValue = (topicMap: Record<string, number>, value: number): string | undefined => {
    const entry = Object.entries(topicMap).find(([key, val]) => val === value);
    return entry ? entry[0] : undefined;
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User is not logged in." },
        { status: 404 }
      );
    }

    const body = await req.json();
    // Unpack type and name
    const { type, name, threshold, nodeAmount, topicMap, userPathwayId, currentQuestionIndex, currentTopicIndex } = checkCorrectAnswersSchema.parse(body);

    // Query all statistics the user has done
    const realUserId = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        userId: true,
      },
    });

    if (!realUserId) {
      return NextResponse.json(
        { error: "User cannot be found." },
        { status: 404 }
      );
    }

    // 1. We need to get all of the user's attempts
    const attemptsIds = await prisma.attempt.findMany({
      where: {
        userId: realUserId.userId,
      },
      select: {
        attemptId: true,
      },
    });

    const attemptIdList = attemptsIds.map((a) => a.attemptId);

    // 2. Query the appropriate type
    let answerList: { [key: string]: Prisma.JsonValue }[] = [];
    if (type == "skills") {
      answerList = await prisma.statistics.findMany({
        where: {
          attemptId: { in: attemptIdList },
        },
        select: {
          skills: true,
        },
      }).then(data => data.map(item => ({ skills: item.skills })));
    } else if (type == "topics") {
      answerList = await prisma.statistics.findMany({
        where: {
          attemptId: { in: attemptIdList },
        },
        select: {
          topics: true,
        },
      }).then(data => data.map(item => ({ topics: item.topics })));
    } else if (type == "subTopics") {
      answerList = await prisma.statistics.findMany({
        where: {
          attemptId: { in: attemptIdList },
        },
        select: {
          subTopics: true,
        },
      }).then(data => data.map(item => ({ subTopics: item.subTopics })));
    }

    // 3. Count the occurrences of that name of correct answers
    let correctAnswerCount = 0;
    answerList.forEach((item) => {
      if (item[type] && Object.keys(item[type]).length != 0) {

        const data = item[type] as answerData

        const instance = data[name]

        if (instance) {
          correctAnswerCount += instance.correctAnswerCount;
        }
      }
    });




    let currentNodeIndex = currentQuestionIndex
    let currentTopicIndexValue = currentTopicIndex
    let topic: string | undefined
    topic = findKeyByValue(topicMap, currentTopicIndex)




    if (correctAnswerCount >= threshold){
      // 5. it is greater so they have passed the node lets check if they finished that topic
      if (currentNodeIndex === nodeAmount - 1){
        // reset for next topic
        currentNodeIndex = 0
        // update the topic index
        currentTopicIndexValue = currentTopicIndexValue + 1
        topic = findKeyByValue(topicMap, currentTopicIndexValue)

        if (topic === undefined){
        // TODO IF TOPIC IS UNDEFINED THEN PATHWAY IS COMPLETED

        }else if (topic){
          const newCurrentNode = {"topic":topic, "index": currentNodeIndex}
          await prisma.userPathways.update({
            where:{
              userPathwayId: userPathwayId
            },
            data:{
              currentNode: newCurrentNode
            }

          })
        }
      }else{
        currentNodeIndex = currentNodeIndex + 1
        const newCurrentNode = {"topic":topic, "index": currentNodeIndex}
        console.log("old ", newCurrentNode)

        await prisma.userPathways.update({
          where:{
            userPathwayId: userPathwayId
          },
          data:{
            currentNode: newCurrentNode
          }

        })
      }

    }



    return NextResponse.json(
      {
        correctAnswerCount: correctAnswerCount,
        currentNodeIndex: currentNodeIndex,
        currentTopicIndex: currentTopicIndexValue,
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
    // Handle unexpected errors
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

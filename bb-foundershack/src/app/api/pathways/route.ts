import { prisma } from "@/lib/db";
import { pathwaySchema } from "@/schemas/pathways";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Handles the POST request to start a new user pathway or retrieve an existing one.
 *
 * @param {Request} req - The request object containing the pathwayId and userId.
 * @returns {Promise<NextResponse>} - The response object containing the userPathwayId or an error message.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body and validate against the schema
    const body = await req.json();
    const { pathwayId, userId } = pathwaySchema.parse(body);

    // 1. Check if the user has already started pathway
    const userPathway = await prisma.userPathways.findFirst({
      where: {
        pathwayId: pathwayId,
        userId: userId,
      },
    });

    // 2. If that pathway exist awesome! Let's give it back to the user
    if (userPathway) {
      return NextResponse.json(
        {
          userPathwayId: userPathway.userPathwayId,
        },
        {
          status: 200,
        }
      );
    }

    // 3. If not then we have to do some work first we need to set the first node as the first index
    const pathway = await prisma.pathways.findUnique({
      where: {
        pathwayId: pathwayId,
      },
    });

    let firstTopic = "";
    if (pathway) {
      const nodes = pathway.nodes;
      if (nodes) {
        firstTopic = Object.keys(nodes)[0];
      } else {
        return NextResponse.json(
          { error: "Nodes not found in pathway." },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Pathway not found." },
        { status: 404 }
      );
    }

    const currentNode = { topic: firstTopic, index: 0 };

    // 4. We have to make an instance
    const newPathway = await prisma.userPathways.create({
      data: {
        userId: userId,
        pathwayId: pathwayId,
        currentNode: currentNode,
      },
    });
    return NextResponse.json(
      {
        userPathwayId: newPathway.userPathwayId,
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

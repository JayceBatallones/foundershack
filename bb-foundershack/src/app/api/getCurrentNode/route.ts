import { prisma } from "@/lib/db";
import { getCurrentNodeSchema } from "@/schemas/pathways";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Handles the POST request to fetch the current node of a user pathway.
 *
 * @param {Request} req - The request object containing the user pathway ID.
 * @returns {Promise<NextResponse>} - The response object containing the current node information or an error message.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body and validate against the schema
    const body = await req.json();
    const { userPathwayId } = getCurrentNodeSchema.parse(body);

    // Fetch the user pathway based on the provided ID
    const userPathways = await prisma.userPathways.findUnique({
      where: {
        userPathwayId: userPathwayId,
      },
      select: {
        currentNode: true,
      },
    });

    // If no user pathway is found, return an error response
    if (!userPathways) {
      return NextResponse.json({
        error: "Could not find a user pathway",
      });
    }

    // Extract the current node from the user pathway
    const currentNode = userPathways.currentNode as {
      topic: string;
      index: number;
    };

    // Return the current node information
    return NextResponse.json(
      {
        currentNode: currentNode,
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
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

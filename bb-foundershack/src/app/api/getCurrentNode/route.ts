import { prisma } from "@/lib/db";
import { getCurrentNodeSchema } from "@/schemas/pathways";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPathwayId } = getCurrentNodeSchema.parse(body);


    const userPathways = await prisma.userPathways.findUnique({
        where:{
            userPathwayId:userPathwayId
        },
        select:{
            currentNode:true
        }
    })

    if (!userPathways){
        return NextResponse.json({
            error: "Could not find a user pathway"
        })
    }
    const currentNode = userPathways.currentNode as { topic: string, index: number };


    return NextResponse.json(
      {
        currentNode: currentNode,
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

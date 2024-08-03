
import PathwayBanner from "@/components/pathways/PathwayBanner";
import { prisma } from "@/lib/db";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { Prisma } from "@prisma/client";

interface PathwayData {
  [key: string]: Prisma.JsonArray[];
}

type pathwayInformation = {
  name: string;
  type: string;
  threshold: number;
  difficulty: string;
  year_level: string;
};

type Props = {
  params: {
    userPathwayId: string;
  };
};

const LearningPathway = async ({ params: { userPathwayId } }: Props) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const userPathways = await prisma.userPathways.findUnique({
    where: {
      userPathwayId: userPathwayId,
    },
  });

  if (!userPathways) {
    redirect("/");
  }

  const pathway = await prisma.pathways.findUnique({
    where: {
      pathwayId: userPathways.pathwayId,
    },
  });

  if (!pathway) {
    redirect("/");
  }


  return (
    <div>test</div>
  );
};

export default LearningPathway;

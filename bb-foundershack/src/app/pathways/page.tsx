import React from 'react'
import { redirect } from "next/navigation";
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';



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

    
  return (
    <div>page</div>
  )
}

export default LearningPathway
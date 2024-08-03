import React from 'react'
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchPathways } from '@/lib/fetchPathways';
import PathwaysCards from '@/components/pathways/PathwaysCards';
import { prisma } from '@/lib/db';


const Pathways = async () => {

    const { userId } = auth()

    if (!userId) {
      return redirect("/");
    }

    const realUserId = await prisma.user.findUnique({
      where:{
        clerkId: userId
      },
      select:{
        userId:true
      }
    })

    if(!realUserId){
      return redirect("/")
    }
    

    const pathwayList = await fetchPathways();
    

  return (
    <PathwaysCards realUserId={realUserId} pathwaysList={pathwayList} />
  )
}

export default Pathways
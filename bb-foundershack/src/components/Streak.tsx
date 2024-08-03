import React from "react";
import { Flame } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = {};

const Streak = async (props: Props) => {
  // Clerk user id
  const { userId } = auth();

  if (!userId) {
    return (<div></div>)
  }

  let streak = 0;

  const userInfo = await prisma.user.findFirst({
    where: {
      clerkId: userId,
    },
    select: {
      streak: true,
      lastQuizDone: true,
    },
  });

  if (userInfo) {
    const today = new Date();
    const lastDate = userInfo.lastQuizDone;
    const numDaysBefore = Math.floor(
      (today.valueOf() - lastDate.valueOf()) / (24 * 60 * 60 * 1000)
    );

    if (numDaysBefore <= 1) {
      streak = userInfo.streak;
    } else {
      streak = 0;
      await prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          streak: 0,
        },
      });
    }
  }

  return (
    <div className="mt-1.5 flex">
      <Flame />
      <p className="mt-0.5 flex">{streak}</p>
    </div>
  );
};

export default Streak;

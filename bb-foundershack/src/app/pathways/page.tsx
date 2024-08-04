import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchPathways } from "@/lib/fetchPathways";
import PathwaysCards from "@/components/pathways/PathwaysCards";
import { prisma } from "@/lib/db";

/**
 * Pathways component fetches and displays a list of pathways available to the authenticated user.
 *
 * @returns {JSX.Element} - The rendered PathwaysCards component with the user's pathways.
 */
const Pathways = async () => {
  // Authenticate the user
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch the real user ID from the database using Clerk's user ID
  const realUserId = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      userId: true,
    },
  });

  if (!realUserId) {
    return redirect("/");
  }

  // Fetch the list of pathways
  const pathwayList = await fetchPathways();

  // Render the PathwaysCards component with the real user ID and pathways list
  return <PathwaysCards realUserId={realUserId} pathwaysList={pathwayList} />;
};

export default Pathways;

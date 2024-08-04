import HistoryCard from "@/components/dashboard/HistoryCard";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import LearningPathwaysCard from "@/components/dashboard/LearningPathwaysCard";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

type Props = {};

/**
 * Dashboard component displaying user-specific and general dashboard cards.
 *
 * @param {Props} props - Component props.
 * @returns {JSX.Element} - The rendered dashboard component.
 */
const Dashboard = async (props: Props) => {
  // Retrieve the Clerk user ID from the authentication context
  const { userId } = auth();

  // Redirect to home page if user is not authenticated
  if (!userId) {
    return redirect("/");
  }

  // Retrieve the real user ID from the database using Clerk user ID
  const realUserId = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      userId: true,
    },
  });

  return (
    <main className="p-8 mx-auto max-w-7xl">
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <QuizMeCard />
        <HistoryCard />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        {/* Conditionally render StatisticsCard if realUserId is available */}
        {realUserId && <StatisticsCard userId={realUserId.userId} />}
        <LearningPathwaysCard />
      </div>
    </main>
  );
};

export default Dashboard;

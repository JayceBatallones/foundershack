import { NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Handles the GET request to create a new user or retrieve existing user information.
 *
 * @returns {Promise<NextResponse>} - The response object indicating the outcome of the operation.
 */
export async function GET() {
  const { userId } = auth();

  // Check if the user is authenticated
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get user's information
  const user = await currentUser();
  if (!user) {
    return new NextResponse("User not exist", { status: 404 });
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        name: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.emailAddresses[0].emailAddress ?? "",
      },
    });
  }

  if (!dbUser) {
    return new NextResponse(null, {
      status: 302, // 302 Found - temporary redirect
      headers: {
        Location: "http://localhost:3000/",
      },
    });
  }
  
  // Perform your Route Handler's logic with the returned user object
  return new NextResponse(null, {
    status: 302, // 302 Found - temporary redirect
    headers: {
      Location: "http://localhost:3000/typeform",
    },
  });
}

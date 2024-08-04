import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();

  if (userId) {
    return redirect("/dashboard");
  }
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Welcome to Big Brain 🔥!</CardTitle>
          <CardDescription>
            Big Brain provides students interactive quizzes to help them excel
            at academics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton>
            <Link href="sign-in">
              {" "}
              <Button>Sign in</Button>{" "}
            </Link>
          </SignInButton>
        </CardContent>
      </Card>
    </div>
  );
}

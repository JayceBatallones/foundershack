import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Streak from "@/components/Streak";

type Props = {};

const userButtonAppearance = {
  elements: {
    userButtonAvatarBox: "w-10 h-10", // Custom width and height
  },
};
const Navbar = async () => {
  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-[59px] border-b border-zinc-300  py-2 ">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href={"/"} className="flex items-center gap-2">
        <img src="/logo.svg" alt="Big Brain Logo" className="w-50 h-50" />

        </Link>

        <div className="flex item-center gap-4">
          <Streak />
          <ThemeToggle />
          <SignedOut>
            <SignInButton>
              <Link href="sign-in">
                {" "}
                <Button>Sign in</Button>{" "}
              </Link>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={userButtonAppearance} />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

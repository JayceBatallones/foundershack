import { SignIn } from "@clerk/nextjs";
import React from "react";

export default function Page() {
  return (
    <div className="mt-40 flex items-center justify-center flex-col gap-10">
      <SignIn
        forceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      />
    </div>
  );
}

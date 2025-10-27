import Link from "next/link";
import React from "react";

const ForgotPassword = () => {
  return (
    <>
      <div className="flex-w-full gap-1.5 flex-col">
        <h1 className="text-1">Forgot your password?</h1>
        <p className="text-subtle text-4-medium">
          Enter your email address below and we’ll send you a link to reset your password.
        </p>
      </div>
      {/* SignInForm gies here  */}

      <Link href="/sign-in" className="text-4-medium text-center w-full">
        Back to login
      </Link>
    </>
  );
};

export default ForgotPassword;

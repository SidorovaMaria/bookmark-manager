import SignInForm from "@/components/forms/SignInForm";
import Link from "next/link";

const SignInPage = () => {
  return (
    <>
      <div className="flex-w-full gap-1.5 flex-col">
        <h1 className="text-1">Log in into you account</h1>
        <p className="text-subtle text-4-medium">Welcome back! Please enter your details.</p>
      </div>

      {/* SignInForm goes here  */}
      <SignInForm />
      <div className="space-y-3 w-full text-center ">
        <p className="text-4-medium text-subtle">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-4 text-n-900 dark:text-n-0">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignInPage;

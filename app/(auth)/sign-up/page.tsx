import SignUpForm from "@/components/forms/SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <>
      <div className="flex-w-full gap-1.5 flex-col">
        <h1 className="text-1">Create your account</h1>
        <p className="text-subtle text-4-medium">
          Join us and start saving your favorite links — organized, searchable, and always within
          reach.
        </p>
      </div>
      <SignUpForm />

      <p className="text-4-medium text-subtle w-full text-center">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-4 text-n-900 dark:text-n-0">
          Log in
        </Link>
      </p>
    </>
  );
}

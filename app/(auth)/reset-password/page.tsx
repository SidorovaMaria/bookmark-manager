import ResetPasswordForm from "@/components/layout/auth/ResetPasswordForm";
import Link from "next/link";

export default function ResetPassword() {
  return (
    <>
      <div className="flex-w-full gap-1.5 flex-col">
        <h1 className="text-1">Reset Your Password</h1>
        <p className="text-subtle text-4-medium">
          Enter your new password below. Make sure it’s strong and secure.
        </p>
      </div>
      <ResetPasswordForm />
      <Link href="/sign-in" className="text-4-medium text-center w-full">
        Back to login
      </Link>
    </>
  );
}

"use client";
import { signIn } from "@/auth/actions";
import Button from "@/components/ui/Button";
import InputForm from "@/components/ui/InputForm";
import { SignInInput, SignInOutput, signInSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "../ui/Toast";
import { redirect } from "next/navigation";

const SignInForm = () => {
  const form = useForm<SignInInput, SignInOutput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const {
    formState: { isSubmitting },
  } = form;
  const onSubmit = async (data: SignInOutput) => {
    const result = await signIn(data);
    if ("error" in result) {
      toast({
        title: result.error,
        icon: "error",
        error: true,
      });
    } else {
      toast({
        title: "Signed in successfully!",
        icon: "check",
      });
      redirect("/");
    }
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <InputForm name="email" label="Email" type="email" placeholder="Enter your email" />
        <InputForm
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <Button type="submit" tier="primary">
          {isSubmitting ? "Signing you in..." : "Sign In"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default SignInForm;

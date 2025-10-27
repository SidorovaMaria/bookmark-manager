"use client";
import { signUp } from "@/auth/actions";
import Button from "@/components/ui/Button";
import InputForm from "@/components/ui/InputForm";
import { SignupInput, SignupOutput, signupSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "../ui/Toast";
import { redirect } from "next/navigation";

const SignUpForm = () => {
  const form = useForm<SignupInput, SignupOutput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const {
    formState: { isSubmitting },
  } = form;
  const onSubmit = async (data: SignupOutput) => {
    const result = await signUp(data);
    if ("error" in result) {
      toast({
        title: result.error,
        icon: "error",
        error: true,
      });
    } else {
      toast({
        title: "Account created successfully!",
        icon: "check",
      });
      redirect("/");
    }
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <InputForm name="name" label="Full name" required type="text" />
        <InputForm name="email" label="Email address" type="email" required />
        <InputForm name="password" label="Password" type="password" required />
        <Button type="submit" tier="primary">
          {isSubmitting ? "Creating your account..." : "Create Account"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default SignUpForm;

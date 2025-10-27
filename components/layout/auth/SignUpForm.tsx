"use client";
import Button from "@/components/ui/Button";
import InputForm from "@/components/ui/InputForm";
import { SignInOutput, SignupInput, SignupOutput, signupSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

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
  const onSubmit = (data: SignInOutput) => {
    console.log(data);
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <InputForm name="name" label="Full name" required type="text" />
        <InputForm name="email" label="Email address" type="email" required />
        <InputForm name="password" label="Password" type="password" required />
        <Button type="submit" tier="primary">
          Create Account
        </Button>
      </form>
    </FormProvider>
  );
};

export default SignUpForm;

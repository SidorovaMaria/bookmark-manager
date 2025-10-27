"use client";
import Button from "@/components/ui/Button";
import InputForm from "@/components/ui/InputForm";
import { SignInInput, SignInOutput, signInSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

const SignInForm = () => {
  const form = useForm<SignInInput, SignInOutput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
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
        <InputForm name="email" label="Email" type="email" placeholder="Enter your email" />
        <InputForm
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />
        <Button type="submit" tier="primary">
          Login
        </Button>
      </form>
    </FormProvider>
  );
};

export default SignInForm;

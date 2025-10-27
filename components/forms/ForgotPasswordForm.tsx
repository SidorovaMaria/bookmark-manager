"use client";
import Button from "@/components/ui/Button";
import InputForm from "@/components/ui/InputForm";
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
  forgotPasswordSchema,
} from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordInput, ForgotPasswordOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });
  const onSubmit = (data: ForgotPasswordOutput) => {
    console.log(data);
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <InputForm
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <Button type="submit" tier="primary">
          Send reset link
        </Button>
      </form>
    </FormProvider>
  );
};

export default ForgotPasswordForm;

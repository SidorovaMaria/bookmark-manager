"use client";
import Button from "@/components/ui/Button";
import InputForm from "@/components/ui/InputForm";
import {
  ResetPasswordInput,
  ResetPasswordOutput,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

const ResetPasswordForm = () => {
  const form = useForm<ResetPasswordInput, ResetPasswordOutput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });
  const onSubmit = (data: ResetPasswordOutput) => {
    console.log(data);
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <InputForm name="password" label="New Password" type="password" required />
        <InputForm name="confirmPassword" label="Confirm Password" type="password" required />
        <Button type="submit" tier="primary">
          Reset Password
        </Button>
      </form>
    </FormProvider>
  );
};

export default ResetPasswordForm;

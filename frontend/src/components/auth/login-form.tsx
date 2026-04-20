"use client";

import { LoginSchema, type LoginDto } from "@spec-app/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";

import { signIn } from 'next-auth/react';

export function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: "/dashboard",
    });
    } catch (error) {
      alert(error);
    }
    
  });
  return (
    <Card.Root className="w-full max-w-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Card.Header className="flex flex-col items-center gap-4 pb-2 pt-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-blue-600 p-2.5 shadow-sm">
          <Image
            src="/app-icon.svg"
            alt=""
            width={40}
            height={40}
            className="size-10 object-contain"
            priority
          />
        </div>
        <div className="space-y-1">
          <Card.Title className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            SpecBuilder
          </Card.Title>
          <Card.Description className="text-sm text-zinc-500 dark:text-zinc-400">
            Please enter your credentials to access the application
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="px-8 pb-8 pt-2">
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField.Root
                fullWidth
                isInvalid={!!fieldState.error}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              >
                <Label.Root className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Email
                </Label.Root>
                <Input.Root
                  autoComplete="email"
                  className="mt-1.5 border-zinc-200 dark:border-zinc-700"
                  placeholder="name@company.com"
                  type="email"
                />
                {fieldState.error ? (
                  <FieldError className="mt-1">
                    {fieldState.error.message}
                  </FieldError>
                ) : null}
              </TextField.Root>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField.Root
                fullWidth
                isInvalid={!!fieldState.error}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              >
                <Label.Root className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Password
                </Label.Root>
                <Input.Root
                  autoComplete="current-password"
                  className="mt-1.5 border-zinc-200 dark:border-zinc-700"
                  type="password"
                />
                {fieldState.error ? (
                  <FieldError className="mt-1">
                    {fieldState.error.message}
                  </FieldError>
                ) : null}
              </TextField.Root>
            )}
          />
          <Button
            className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
            fullWidth
            isDisabled={isSubmitting}
            type="submit"
            variant="primary"
          >
            Sign In
          </Button>
        </form>
      </Card.Content>
    </Card.Root>
  );
}

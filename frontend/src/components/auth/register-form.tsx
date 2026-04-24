"use client";

import { RegisterSchema, type RegisterDto } from "@spec-app/schemas";
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
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { signIn } from "next-auth/react";

import { api } from "@/lib/api/client";

export function RegisterForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<RegisterDto>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await api.post("/auth/register", data);
    } catch (err) {
      let message = "Registration failed. Please try again.";
      if (isAxiosError(err)) {
        const body = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        if (body?.message) {
          message = Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message;
        }
      }
      setError("root", { message });
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("root", {
        message:
          "Account created but sign-in failed. Please sign in manually.",
      });
      return;
    }

    globalThis.location.assign("/dashboard");
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
            Create account
          </Card.Title>
          <Card.Description className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your details to register for SpecBuilder
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="px-8 pb-8 pt-2">
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="firstName"
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
                    First name
                  </Label.Root>
                  <Input.Root
                    autoComplete="given-name"
                    className="mt-1.5 border-zinc-200 dark:border-zinc-700"
                    placeholder="Jane"
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
              name="lastName"
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
                    Last name
                  </Label.Root>
                  <Input.Root
                    autoComplete="family-name"
                    className="mt-1.5 border-zinc-200 dark:border-zinc-700"
                    placeholder="Doe"
                  />
                  {fieldState.error ? (
                    <FieldError className="mt-1">
                      {fieldState.error.message}
                    </FieldError>
                  ) : null}
                </TextField.Root>
              )}
            />
          </div>
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
                  autoComplete="new-password"
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
          {errors.root ? (
            <FieldError>{errors.root.message}</FieldError>
          ) : null}
          <Button
            className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
            fullWidth
            isDisabled={isSubmitting}
            type="submit"
            variant="primary"
          >
            Create account
          </Button>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </form>
      </Card.Content>
    </Card.Root>
  );
}

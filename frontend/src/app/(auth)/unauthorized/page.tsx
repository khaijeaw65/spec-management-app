import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 dark:bg-zinc-950">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          You need to sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This area is only available after you sign in with your account.
        </p>
        <Link
          className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

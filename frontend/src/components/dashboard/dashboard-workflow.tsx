import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Link2,
  Zap,
} from "lucide-react";
import { Fragment } from "react";

import { Card } from "@heroui/react";

const steps = [
  {
    n: 1,
    title: "Import MOM",
    description:
      "Paste or upload Minutes of Meeting in plain text. Content is stored privately (S3 key + bucket in production).",
    icon: FileText,
  },
  {
    n: 2,
    title: "Select template",
    description:
      "Choose a main template; section structure drives the generated specification layout.",
    icon: BookOpen,
  },
  {
    n: 3,
    title: "Generate spec",
    description:
      "A job is queued (SQS). The worker calls the model once per version — never from the HTTP request.",
    icon: Zap,
  },
  {
    n: 4,
    title: "Review",
    description:
      "Inspect sections, ambiguities, and risks. Mark reviewed when clarified; export PDF when ready.",
    icon: CheckCircle2,
  },
] as const;

export function DashboardWorkflow() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-zinc-500" aria-hidden />
        <h2 className="text-sm font-semibold text-zinc-900">
          Specification workflow
        </h2>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {steps.map((step, i) => (
          <Fragment key={step.n}>
            <Card.Root className="min-w-0 flex-1 border border-zinc-200 bg-white shadow-sm">
              <Card.Content className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <step.icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-zinc-950">
                      Step {step.n}: {step.title}
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex justify-end">
                  <span className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {step.n}
                  </span>
                </div>
              </Card.Content>
            </Card.Root>
            {i < steps.length - 1 ? (
              <div
                className="flex shrink-0 items-center justify-center text-zinc-300 lg:w-6"
                aria-hidden
              >
                <ChevronRight className="size-5 rotate-90 lg:rotate-0" />
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

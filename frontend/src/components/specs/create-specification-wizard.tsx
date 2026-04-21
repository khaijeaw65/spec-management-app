"use client";

import {
  CreateSpecStep1Schema,
  CreateSpecStep2Schema,
} from "@spec-app/schemas";
import {
  Alert,
  Button,
  Card,
  Chip,
  Label,
  Skeleton,
  Tabs,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { Key } from "react-aria-components";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileUp,
  Lightbulb,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { languageLabel } from "@/lib/spec-list-utils";
import { templateQueryKeys } from "@/lib/template-query-keys";
import { generateSpec } from "@/services/spec.service";
import { getUserTemplates } from "@/services/template.service";
import { cn } from "@/lib/utils";

function apiErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (body?.message) {
      return Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message;
    }
  }
  return "Could not start generation. Try again.";
}

type WizardFormValues = {
  inputMethod: "paste" | "upload";
  momContent: string;
  fileName: string;
  fileSize: number;
  templateId: string;
  /** User-provided title; maps to backend `main_generated_spec.name` when wired */
  name: string;
  /** Optional; maps to `main_generated_spec.description` */
  description: string;
};

export function CreateSpecificationWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const templatesQuery = useQuery({
    queryKey: templateQueryKeys.list(),
    queryFn: getUserTemplates,
  });

  const generateMutation = useMutation({
    mutationFn: generateSpec,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["spec"] });
      toast.success("Specification queued for generation.");
      router.push(`/specifications/${result.id}/${result.versionId}`);
    },
    onError: (err) => {
      toast.danger(apiErrorMessage(err));
    },
  });

  const {
    register,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<WizardFormValues>({
    defaultValues: {
      inputMethod: "paste",
      momContent: "",
      fileName: "",
      fileSize: 0,
      templateId: "",
      name: "",
      description: "",
    },
  });

  const inputMethod = watch("inputMethod");
  const momContent = watch("momContent");
  const fileName = watch("fileName");
  const templateId = watch("templateId");

  const selectedTemplate = useMemo(
    () => templatesQuery.data?.find((t) => t.id === templateId),
    [templatesQuery.data, templateId],
  );

  const momLen = momContent.length;
  const momValid = inputMethod === "paste" && momLen >= 50;

  const onDropFile = useCallback(
    (file: File) => {
      const lower = file.name.toLowerCase();
      const ok =
        lower.endsWith(".txt") ||
        lower.endsWith(".docx") ||
        lower.endsWith(".pdf");
      if (!ok) return;
      setUploadedFile(file);
      setValue("fileName", file.name, { shouldValidate: true });
      setValue("fileSize", file.size, { shouldValidate: true });
      setStep1Error(null);
    },
    [setValue],
  );

  const goNext = () => {
    setStep1Error(null);
    const v = getValues();
    const step1Payload =
      v.inputMethod === "paste"
        ? { inputMethod: "paste" as const, momContent: v.momContent }
        : {
            inputMethod: "upload" as const,
            fileName: v.fileName,
            fileSize: v.fileSize,
          };
    const parsed = CreateSpecStep1Schema.safeParse(step1Payload);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ?? "Check your meeting notes input.";
      setStep1Error(msg);
      return;
    }
    setStep(2);
  };

  const onGenerate = handleSubmit((data) => {
    setSubmitError(null);
    const step2Parsed = CreateSpecStep2Schema.safeParse({
      templateId: data.templateId,
      name: data.name,
      description: data.description?.trim() || undefined,
    });
    if (!step2Parsed.success) {
      setSubmitError(
        step2Parsed.error.issues[0]?.message ?? "Select a template.",
      );
      return;
    }
    const step1Parsed = CreateSpecStep1Schema.safeParse(
      data.inputMethod === "paste"
        ? { inputMethod: "paste", momContent: data.momContent }
        : {
            inputMethod: "upload",
            fileName: data.fileName,
            fileSize: data.fileSize,
          },
    );
    if (!step1Parsed.success) {
      setStep(1);
      setStep1Error(
        step1Parsed.error.issues[0]?.message ?? "Invalid meeting notes.",
      );
      return;
    }

    const templates = templatesQuery.data;
    const tmpl = templates?.find((t) => t.id === data.templateId);
    if (!tmpl) {
      setSubmitError("Select a valid template.");
      return;
    }

    if (data.inputMethod === "upload" && !uploadedFile) {
      setSubmitError("Select a file to upload.");
      return;
    }

    const form = new FormData();
    form.append("name", data.name.trim());
    const desc = data.description?.trim();
    if (desc) form.append("description", desc);
    form.append("inputType", data.inputMethod === "paste" ? "TEXT" : "FILE");
    form.append("mainTemplateId", tmpl.id);
    form.append("versionId", tmpl.versionId);
    if (data.inputMethod === "paste") {
      form.append("momContent", data.momContent);
    } else {
      form.append("file", uploadedFile!);
    }

    generateMutation.mutate(form);
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/specifications"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Specifications
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Create Specification
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Convert your meeting notes into a structured specification.
          </p>

          <ol
            className="mt-6 flex items-center gap-2"
            aria-label="Progress"
          >
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                  step === 1
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white",
                )}
              >
                {step === 2 ? (
                  <Check className="size-5" aria-hidden />
                ) : (
                  "1"
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  step === 1
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                Meeting notes
              </span>
            </li>
            <div
              className="h-px min-w-[2rem] flex-1 bg-zinc-200 dark:bg-zinc-700"
              aria-hidden
            />
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                  step === 2
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
                )}
              >
                2
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  step === 2
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                Template &amp; details
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-6">
        {step === 1 ? (
          <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Card.Header className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Upload className="size-5" aria-hidden />
                </div>
                <div>
                  <Card.Title className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    Paste Your Meeting Notes
                  </Card.Title>
                  <Card.Description className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Copy and paste the minutes of meeting (MOM) from your
                    recent discussion.
                  </Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="space-y-5 px-5 py-5">
              <Tabs.Root
                selectedKey={inputMethod}
                onSelectionChange={(key: Key) => {
                  const k = String(key);
                  const m = k === "upload" ? "upload" : "paste";
                  setValue("inputMethod", m);
                  setStep1Error(null);
                  if (m === "paste") {
                    setUploadedFile(null);
                    setValue("fileName", "");
                    setValue("fileSize", 0);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }
                }}
                className="w-full"
              >
                <Tabs.ListContainer className="rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
                  <Tabs.List className="flex w-full gap-0">
                    <Tabs.Tab
                      id="paste"
                      className="flex-1 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-600 outline-none data-selected:text-blue-600 dark:text-zinc-400 dark:data-selected:text-blue-400"
                    >
                      Type / Paste
                      <Tabs.Indicator className="bg-white shadow-sm dark:bg-zinc-900" />
                    </Tabs.Tab>
                    <Tabs.Tab
                      id="upload"
                      className="flex-1 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-600 outline-none data-selected:text-blue-600 dark:text-zinc-400 dark:data-selected:text-blue-400"
                    >
                      Upload file
                      <Tabs.Indicator className="bg-white shadow-sm dark:bg-zinc-900" />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="paste" className="mt-4 outline-none">
                  <TextField.Root fullWidth>
                    <Label.Root className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Meeting Notes (MOM)
                    </Label.Root>
                    <TextArea.Root
                      className="mt-1.5 min-h-[200px] border-zinc-200 font-sans dark:border-zinc-700"
                      placeholder="Paste your meeting notes here…"
                      {...register("momContent")}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Minimum 50 characters required ({momLen}/50)
                    </p>
                  </TextField.Root>
                </Tabs.Panel>

                <Tabs.Panel id="upload" className="mt-4 outline-none">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.docx,.pdf,application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onDropFile(f);
                    }}
                  />
                  <button
                    type="button"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) onDropFile(f);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
                  >
                    <FileUp
                      className="size-10 text-zinc-400 dark:text-zinc-500"
                      aria-hidden
                    />
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      Drag and drop a file here, or click to browse
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Accepted: .txt, .docx, .pdf
                    </span>
                  </button>
                  {watch("fileName") ? (
                    <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="font-medium">{watch("fileName")}</span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {" "}
                        ({Math.ceil(watch("fileSize") / 1024)} KB)
                      </span>
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    File will be processed on the server.
                  </p>
                </Tabs.Panel>
              </Tabs.Root>

              {step1Error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {step1Error}
                </p>
              ) : null}

              <Alert.Root status="accent" className="border border-blue-100">
                <Alert.Indicator>
                  <Lightbulb className="size-5" aria-hidden />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Description className="text-sm text-zinc-700 dark:text-zinc-300">
                    Tip: Include as much detail as possible about requirements,
                    stakeholders, timelines, and any special considerations.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  className="gap-2 bg-blue-600 text-white"
                  isDisabled={
                    (inputMethod === "paste" && !momValid) ||
                    (inputMethod === "upload" && !watch("fileName"))
                  }
                  onPress={goNext}
                >
                  Next: Select Template
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
        ) : (
          <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Card.Header className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <FileUp className="size-5" aria-hidden />
                </div>
                <div>
                  <Card.Title className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    Name &amp; template
                  </Card.Title>
                  <Card.Description className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Choose a template. Output language matches the template (English
                    or Thai).
                  </Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="space-y-6 px-5 py-5">
              <input type="hidden" {...register("templateId")} />
              <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  Meeting notes source
                </p>
                {inputMethod === "upload" ? (
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-500 dark:text-zinc-400">File: </span>
                    {fileName || "—"}
                  </p>
                ) : (
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Pasted text ({momContent.trim().length} characters)
                  </p>
                )}
              </div>

              <TextField.Root fullWidth>
                <Label.Root className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Specification name
                </Label.Root>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Shown in your list and used as the stable spec title when the API
                  is connected.
                </p>
                <input
                  type="text"
                  className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  placeholder="e.g. Q1 2026 CRM rollout spec"
                  autoComplete="off"
                  {...register("name")}
                />
              </TextField.Root>

              <TextField.Root fullWidth>
                <Label.Root className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Description
                </Label.Root>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Optional summary or context for this specification (stored with the
                  spec record when the API is connected).
                </p>
                <TextArea.Root
                  className="mt-2 min-h-[100px] border-zinc-200 font-sans dark:border-zinc-700"
                  placeholder="e.g. Scope, stakeholders, or goals for this version…"
                  {...register("description")}
                />
              </TextField.Root>

              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Templates
                </p>
                {templatesQuery.isPending ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {["a", "b", "c", "d"].map((k) => (
                      <div
                        key={k}
                        className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                      >
                        <Skeleton.Root className="h-5 w-3/4 rounded-md" />
                        <Skeleton.Root className="mt-2 h-4 w-full rounded-md" />
                        <Skeleton.Root className="mt-3 h-6 w-24 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : templatesQuery.isError ? (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                    Could not load templates. Refresh the page or try again later.
                  </p>
                ) : !templatesQuery.data?.length ? (
                  <div className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      Create a template first, then you can generate a specification.
                    </p>
                    <Link
                      href="/templates/create"
                      className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      New template
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {templatesQuery.data.map((t) => {
                      const selected = templateId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            setValue("templateId", t.id, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "relative rounded-xl border p-4 text-left transition-colors",
                            selected
                              ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-500"
                              : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
                          )}
                        >
                          {selected ? (
                            <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="size-3.5" aria-hidden />
                            </span>
                          ) : null}
                          <p className="pr-8 font-semibold text-zinc-950 dark:text-zinc-50">
                            {t.name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {t.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Chip.Root
                              color="default"
                              size="sm"
                              variant="secondary"
                            >
                              <Chip.Label>
                                {t.sectionCount} sections
                              </Chip.Label>
                            </Chip.Root>
                            <Chip.Root
                              color="default"
                              size="sm"
                              variant="secondary"
                            >
                              <Chip.Label>
                                {languageLabel(t.language)}
                              </Chip.Label>
                            </Chip.Root>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.templateId ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.templateId.message}
                  </p>
                ) : null}
              </div>

              {selectedTemplate ? (
                <p className="rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Output language:{" "}
                  </span>
                  {languageLabel(selectedTemplate.language)} (from template)
                </p>
              ) : null}

              {submitError ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="gap-2 bg-blue-600 text-white"
                  isDisabled={
                    generateMutation.isPending ||
                    templatesQuery.isPending ||
                    !templatesQuery.data?.length
                  }
                  onPress={() => void onGenerate()}
                >
                  {generateMutation.isPending
                    ? "Starting…"
                    : "Generate Specification"}
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
        )}
      </div>
    </div>
  );
}

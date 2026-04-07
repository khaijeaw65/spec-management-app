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
  Radio,
  RadioGroup,
  Tabs,
  TextArea,
  TextField,
} from "@heroui/react";
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
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { queuePendingSpecification } from "@/lib/spec-session";
import { TEMPLATE_DETAILS, TEMPLATE_ORDER } from "@/mocks/template.mock";
import type { SpecLanguage } from "@/types/spec.types";
import type { SpecificationListItem } from "@/types/spec.types";
import { cn } from "@/lib/utils";

type WizardFormValues = {
  inputMethod: "paste" | "upload";
  momContent: string;
  fileName: string;
  fileSize: number;
  templateId: string;
  language: SpecLanguage;
};

const ACCEPT = ".txt,.docx,.application/pdf,.pdf";

function titleFromMom(text: string): string {
  const line = text.trim().split("\n")[0]?.trim() ?? "";
  if (!line) return "New specification";
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

export function CreateSpecificationWizard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      language: "en",
    },
  });

  const inputMethod = watch("inputMethod");
  const momContent = watch("momContent");
  const templateId = watch("templateId");
  const language = watch("language");

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
      language: data.language,
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

    const tmpl = TEMPLATE_DETAILS[data.templateId];
    if (!tmpl) {
      setSubmitError("Invalid template.");
      return;
    }

    const newItem: SpecificationListItem = {
      id: `spec-${globalThis.crypto.randomUUID()}`,
      title:
        data.inputMethod === "paste"
          ? titleFromMom(data.momContent)
          : `Specification from ${data.fileName}`,
      templateLabel: tmpl.name,
      version: 1,
      sectionCount: tmpl.sections.length,
      language: data.language,
      status: "PROCESSING",
      updatedAt: new Date().toISOString(),
    };

    queuePendingSpecification(newItem);
    router.push("/specifications");
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/specifications"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Specifications
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Create Specification
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
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
                  step === 1 ? "text-zinc-900" : "text-zinc-500",
                )}
              >
                Meeting notes
              </span>
            </li>
            <div
              className="h-px min-w-[2rem] flex-1 bg-zinc-200"
              aria-hidden
            />
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                  step === 2
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-200 text-zinc-500",
                )}
              >
                2
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  step === 2 ? "text-zinc-900" : "text-zinc-500",
                )}
              >
                Template &amp; language
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-6">
        {step === 1 ? (
          <Card.Root className="border border-zinc-200 bg-white shadow-sm">
            <Card.Header className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Upload className="size-5" aria-hidden />
                </div>
                <div>
                  <Card.Title className="text-lg font-semibold text-zinc-950">
                    Paste Your Meeting Notes
                  </Card.Title>
                  <Card.Description className="mt-1 text-sm text-zinc-600">
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
                }}
                className="w-full"
              >
                <Tabs.ListContainer className="rounded-full bg-zinc-100 p-1">
                  <Tabs.List className="flex w-full gap-0">
                    <Tabs.Tab
                      id="paste"
                      className="flex-1 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-600 outline-none data-selected:text-blue-600"
                    >
                      Type / Paste
                      <Tabs.Indicator className="bg-white shadow-sm" />
                    </Tabs.Tab>
                    <Tabs.Tab
                      id="upload"
                      className="flex-1 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-600 outline-none data-selected:text-blue-600"
                    >
                      Upload file
                      <Tabs.Indicator className="bg-white shadow-sm" />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="paste" className="mt-4 outline-none">
                  <TextField.Root fullWidth>
                    <Label.Root className="text-sm font-medium text-zinc-900">
                      Meeting Notes (MOM)
                    </Label.Root>
                    <TextArea.Root
                      className="mt-1.5 min-h-[200px] border-zinc-200 font-sans"
                      placeholder="Paste your meeting notes here…"
                      {...register("momContent")}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
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
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <FileUp className="size-10 text-zinc-400" aria-hidden />
                    <span className="text-sm font-medium text-zinc-800">
                      Drag and drop a file here, or click to browse
                    </span>
                    <span className="text-xs text-zinc-500">
                      Accepted: .txt, .docx, .pdf
                    </span>
                  </button>
                  {watch("fileName") ? (
                    <p className="mt-3 text-sm text-zinc-700">
                      <span className="font-medium">{watch("fileName")}</span>
                      <span className="text-zinc-500">
                        {" "}
                        ({Math.ceil(watch("fileSize") / 1024)} KB)
                      </span>
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">
                    File will be processed on the server.
                  </p>
                </Tabs.Panel>
              </Tabs.Root>

              {step1Error ? (
                <p className="text-sm text-red-600" role="alert">
                  {step1Error}
                </p>
              ) : null}

              <Alert.Root status="accent" className="border border-blue-100">
                <Alert.Indicator>
                  <Lightbulb className="size-5" aria-hidden />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Description className="text-sm text-zinc-700">
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
          <Card.Root className="border border-zinc-200 bg-white shadow-sm">
            <Card.Header className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileUp className="size-5" aria-hidden />
                </div>
                <div>
                  <Card.Title className="text-lg font-semibold text-zinc-950">
                    Select Template &amp; Language
                  </Card.Title>
                  <Card.Description className="mt-1 text-sm text-zinc-600">
                    Choose a template and the language for generated sections.
                  </Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="space-y-6 px-5 py-5">
              <input type="hidden" {...register("templateId")} />
              <div>
                <p className="text-sm font-medium text-zinc-900">Templates</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TEMPLATE_ORDER.map((tid) => {
                    const t = TEMPLATE_DETAILS[tid];
                    const selected = templateId === tid;
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() =>
                          setValue("templateId", tid, { shouldValidate: true })
                        }
                        className={cn(
                          "relative rounded-xl border p-4 text-left transition-colors",
                          selected
                            ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                            : "border-zinc-200 hover:border-zinc-300",
                        )}
                      >
                        {selected ? (
                          <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check className="size-3.5" aria-hidden />
                          </span>
                        ) : null}
                        <p className="pr-8 font-semibold text-zinc-950">
                          {t.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {t.shortDescription}
                        </p>
                        <Chip.Root
                          color="default"
                          size="sm"
                          variant="secondary"
                          className="mt-2"
                        >
                          <Chip.Label>
                            {t.sections.length} sections
                          </Chip.Label>
                        </Chip.Root>
                      </button>
                    );
                  })}
                </div>
                {errors.templateId ? (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.templateId.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label.Root className="text-sm font-medium text-zinc-900">
                  Output language
                </Label.Root>
                <p className="mt-1 text-xs text-zinc-500">
                  Changing language later will require generating a new version.
                </p>
                <RadioGroup.Root
                  value={language}
                  onChange={(v) =>
                    setValue("language", v as SpecLanguage, {
                      shouldValidate: true,
                    })
                  }
                  className="mt-3 flex flex-col gap-2"
                >
                  <div className="flex flex-wrap gap-6">
                    <Radio.Root value="en" className="flex items-center gap-2">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="text-sm text-zinc-800">
                        English
                      </Radio.Content>
                    </Radio.Root>
                    <Radio.Root value="th" className="flex items-center gap-2">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="text-sm text-zinc-800">
                        Thai (ไทย)
                      </Radio.Content>
                    </Radio.Root>
                  </div>
                </RadioGroup.Root>
              </div>

              {submitError ? (
                <p className="text-sm text-red-600" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-3 border-t border-zinc-100 pt-4">
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
                  onPress={() => void onGenerate()}
                >
                  Generate Specification
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

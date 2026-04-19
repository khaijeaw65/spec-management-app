"use client";

import { Download, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SpecificationMomFile } from "@/types/spec-detail.types";

import type { MomPreviewState } from "./use-mom-preview";
import { useMomPreview } from "./use-mom-preview";

function extensionLabel(ext: SpecificationMomFile["extension"]): string {
  switch (ext) {
    case "txt":
      return "Plain text";
    case "pdf":
      return "PDF";
    case "docx":
      return "Word (.docx)";
    default: {
      const _e: never = ext;
      return _e;
    }
  }
}

function MomPreviewSection({
  mom,
  preview,
}: Readonly<{
  mom: SpecificationMomFile;
  preview: MomPreviewState;
}>) {
  const showLoading =
    (mom.extension === "txt" || mom.extension === "docx") &&
    (preview.status === "idle" || preview.status === "loading");

  if (mom.extension === "pdf") {
    return (
      <iframe
        title={`Preview of ${mom.fileName}`}
        src={mom.downloadUrl}
        className="h-[min(480px,70vh)] w-full rounded-lg border border-zinc-200 bg-zinc-50"
      />
    );
  }

  if (mom.extension === "txt") {
    return (
      <>
        {showLoading ? (
          <p className="text-sm text-zinc-500">Loading preview…</p>
        ) : null}
        {preview.status === "error" ? (
          <p className="text-sm text-amber-800">{preview.message}</p>
        ) : null}
        {preview.status === "txt" ? (
          <pre className="max-h-[min(480px,70vh)] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800">
            {preview.text}
          </pre>
        ) : null}
      </>
    );
  }

  return (
    <>
      {showLoading ? (
        <p className="text-sm text-zinc-500">Loading preview…</p>
      ) : null}
      {preview.status === "error" ? (
        <p className="text-sm text-amber-800">{preview.message}</p>
      ) : null}
      {preview.status === "docx-html" ? (
        <div
          className="max-h-[min(480px,70vh)] overflow-auto rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-800 [&_p]:mb-2 [&_p:last-child]:mb-0"
          // mammoth output is HTML; demo uses same-origin files only.
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      ) : null}
    </>
  );
}

export function MomFilePanel({
  mom,
  className,
}: Readonly<{
  mom: SpecificationMomFile;
  className?: string;
}>) {
  const preview = useMomPreview(mom);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText
            className="size-4 shrink-0 text-zinc-400"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">
              {mom.fileName}
            </p>
            <p className="text-xs text-zinc-500">{extensionLabel(mom.extension)}</p>
          </div>
        </div>
        <a
          href={mom.downloadUrl}
          download={mom.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <Download className="size-4" aria-hidden />
          Download
        </a>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Preview
        </p>
        <MomPreviewSection mom={mom} preview={preview} />
      </div>
    </div>
  );
}

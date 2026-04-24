"use client";

import { Button } from "@heroui/react";
import { Download, FileText } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import { fetchSpecMom } from "@/services/spec.service";
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
    if (preview.status === "error") {
      return (
        <p className="text-sm text-amber-800 dark:text-amber-300">
          {preview.message}
        </p>
      );
    }
    if (preview.status === "pdf") {
      return (
        <iframe
          title={`Preview of ${mom.fileName}`}
          src={preview.url}
          className="h-[min(480px,70vh)] w-full rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
        />
      );
    }
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading preview…
      </p>
    );
  }

  if (mom.extension === "txt") {
    return (
      <>
        {showLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading preview…
          </p>
        ) : null}
        {preview.status === "error" ? (
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {preview.message}
          </p>
        ) : null}
        {preview.status === "txt" ? (
          <pre className="max-h-[min(480px,70vh)] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            {preview.text}
          </pre>
        ) : null}
      </>
    );
  }

  return (
    <>
      {showLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading preview…
        </p>
      ) : null}
      {preview.status === "error" ? (
        <p className="text-sm text-amber-800 dark:text-amber-300">
          {preview.message}
        </p>
      ) : null}
      {preview.status === "docx-html" ? (
        <div
          className="max-h-[min(480px,70vh)] overflow-auto rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 [&_p]:mb-2 [&_p:last-child]:mb-0"
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
  const [downloading, setDownloading] = useState(false);

  const onDownload = useCallback(async () => {
    if (downloading) return;
    if (!mom.versionId && !mom.downloadUrl) return;
    setDownloading(true);
    try {
      if (mom.versionId) {
        const blob = await fetchSpecMom(mom.versionId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mom.fileName;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (mom.downloadUrl) {
        const a = document.createElement("a");
        a.href = mom.downloadUrl;
        a.download = mom.fileName;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } finally {
      setDownloading(false);
    }
  }, [downloading, mom.downloadUrl, mom.fileName, mom.versionId]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-2">
          <FileText
            className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {mom.fileName}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {extensionLabel(mom.extension)}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          isDisabled={downloading || (!mom.versionId && !mom.downloadUrl)}
          onPress={() => {
            void onDownload();
          }}
        >
          <Download className="size-4" aria-hidden />
          {downloading ? "Downloading…" : "Download"}
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Preview
        </p>
        <MomPreviewSection mom={mom} preview={preview} />
      </div>
    </div>
  );
}

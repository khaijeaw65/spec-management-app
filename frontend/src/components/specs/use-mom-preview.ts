"use client";

import { useEffect, useState } from "react";

import type { SpecificationMomFile } from "@/types/spec-detail.types";

export type MomPreviewState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "txt"; text: string }
  | { status: "docx-html"; html: string };

async function fetchTxtPreview(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.text();
}

async function fetchDocxAsHtml(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const buf = await res.arrayBuffer();
  const { convertToHtml } = await import("mammoth");
  const { value: html } = await convertToHtml({ arrayBuffer: buf });
  return html;
}

function previewErrorMessage(ext: "txt" | "docx"): string {
  if (ext === "txt") {
    return "Could not load text preview. Use download to open the file.";
  }
  return "Could not render Word preview. Download the file and open it in Word or a compatible app.";
}

export function useMomPreview(mom: SpecificationMomFile): MomPreviewState {
  const [preview, setPreview] = useState<MomPreviewState>({ status: "idle" });

  useEffect(() => {
    if (mom.extension === "pdf") {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setPreview({ status: "loading" });

      const run = async () => {
        try {
          if (mom.extension === "txt") {
            const text = await fetchTxtPreview(mom.downloadUrl);
            if (!cancelled) setPreview({ status: "txt", text });
            return;
          }
          const html = await fetchDocxAsHtml(mom.downloadUrl);
          if (!cancelled) setPreview({ status: "docx-html", html });
        } catch {
          if (!cancelled) {
            setPreview({
              status: "error",
              message: previewErrorMessage(
                mom.extension === "docx" ? "docx" : "txt",
              ),
            });
          }
        }
      };

      void run();
    });

    return () => {
      cancelled = true;
    };
  }, [mom.downloadUrl, mom.extension]);

  if (mom.extension === "pdf") {
    return { status: "idle" };
  }

  return preview;
}

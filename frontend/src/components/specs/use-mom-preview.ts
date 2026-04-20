"use client";

import { useEffect, useState } from "react";

import { fetchSpecMom } from "@/services/spec.service";
import type { SpecificationMomFile } from "@/types/spec-detail.types";

export type MomPreviewState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "txt"; text: string }
  | { status: "docx-html"; html: string }
  | { status: "pdf"; url: string };

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
    let cancelled = false;
    let pdfObjectUrl: string | undefined;

    const run = async () => {
      const hasApi = Boolean(mom.versionId);
      const hasStatic = Boolean(mom.downloadUrl);
      if (!hasApi && !hasStatic) {
        setPreview({
          status: "error",
          message: "No file source configured.",
        });
        return;
      }

      if (mom.extension === "pdf") {
        setPreview({ status: "loading" });
        try {
          if (mom.versionId) {
            const blob = await fetchSpecMom(mom.versionId);
            if (cancelled) return;
            pdfObjectUrl = URL.createObjectURL(blob);
            setPreview({ status: "pdf", url: pdfObjectUrl });
            return;
          }
          if (mom.downloadUrl) {
            setPreview({ status: "pdf", url: mom.downloadUrl });
          }
        } catch {
          if (!cancelled) {
            setPreview({
              status: "error",
              message:
                "Could not load PDF preview. Try downloading the file.",
            });
          }
        }
        return;
      }

      setPreview({ status: "loading" });

      try {
        if (mom.extension === "txt") {
          let text: string;
          if (mom.versionId) {
            const blob = await fetchSpecMom(mom.versionId);
            text = await blob.text();
          } else {
            text = await fetchTxtPreview(mom.downloadUrl!);
          }
          if (!cancelled) setPreview({ status: "txt", text });
          return;
        }

        let html: string;
        if (mom.versionId) {
          const blob = await fetchSpecMom(mom.versionId);
          const buf = await blob.arrayBuffer();
          const { convertToHtml } = await import("mammoth");
          const { value } = await convertToHtml({ arrayBuffer: buf });
          html = value;
        } else {
          html = await fetchDocxAsHtml(mom.downloadUrl!);
        }
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

    return () => {
      cancelled = true;
      if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl);
    };
  }, [mom.versionId, mom.downloadUrl, mom.extension]);

  return preview;
}

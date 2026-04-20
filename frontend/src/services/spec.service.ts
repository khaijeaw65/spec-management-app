import type {
  GenerateSpecResponseDto,
  LanguageDto,
  SpecDetailDto,
  SpecListQuery,
  SpecListResponseDto,
  SpecStatusDto,
} from "@spec-app/schemas";
import { isAxiosError } from "axios";

import type { SpecStatus } from "@/types/spec.types";

import { api } from "@/lib/api/client";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function messageFromBlob(blob: Blob): Promise<string | null> {
  try {
    const text = await blob.text();
    const parsed = JSON.parse(text) as { message?: string | string[] };
    if (parsed?.message) {
      return Array.isArray(parsed.message)
        ? parsed.message.join(", ")
        : parsed.message;
    }
  } catch {
    /* not JSON */
  }
  return null;
}

export async function getLanguages(): Promise<LanguageDto[]> {
  const { data } = await api.get<LanguageDto[]>("/languages");
  return data;
}

export async function getSpecStatuses(): Promise<SpecStatusDto[]> {
  const { data } = await api.get<SpecStatusDto[]>("/spec-statuses");
  return data;
}

export async function getSpecs(
  query: SpecListQuery,
): Promise<SpecListResponseDto> {
  const params: Record<string, string | number> = {};
  if (query.search) params.search = query.search;
  if (query.status) params.status = query.status;
  if (query.language) params.language = query.language;
  if (query.sort) params.sort = query.sort;
  if (query.page != null) params.page = query.page;
  if (query.limit != null) params.limit = query.limit;

  const { data } = await api.get<SpecListResponseDto>("/specs", { params });
  return data;
}

/** `GET /specs/:mainId/versions/:versionId` */
export async function getSpecDetail(
  mainSpecId: string,
  versionId: string,
): Promise<SpecDetailDto> {
  const { data } = await api.get<SpecDetailDto>(
    `/specs/${mainSpecId}/versions/${versionId}`,
  );
  return data;
}

/** `PATCH /specs/:id/status` — `id` is main spec id (list row id). */
export async function updateSpecStatus(
  mainSpecId: string,
  status: SpecStatus,
): Promise<void> {
  await api.patch(`/specs/${mainSpecId}/status`, { status });
}

/**
 * `GET /specs/:versionId/export` — `versionId` is the generated-spec row id
 * (same as list `versionId` / detail DTO `versionId`), not the main spec id.
 */
export async function exportSpecPdf(versionId: string): Promise<void> {
  try {
    const { data } = await api.get<Blob>(`/specs/${versionId}/export`, {
      responseType: "blob",
    });
    downloadBlob(data, `spec-${versionId}.pdf`);
  } catch (err) {
    if (isAxiosError(err) && err.response?.data instanceof Blob) {
      const msg = await messageFromBlob(err.response.data);
      throw new Error(msg ?? `Export failed (${err.response.status})`);
    }
    if (isAxiosError(err)) {
      const body = err.response?.data as
        | { message?: string | string[] }
        | undefined;
      if (body?.message) {
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message,
        );
      }
    }
    throw err instanceof Error ? err : new Error("Could not export PDF.");
  }
}

/** `GET /specs/:versionId/mom` — binary MOM (generated-spec id). */
export async function fetchSpecMom(versionId: string): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(`/specs/${versionId}/mom`, {
      responseType: "blob",
    });
    return data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.data instanceof Blob) {
      const msg = await messageFromBlob(err.response.data);
      throw new Error(msg ?? `Could not load MOM (${err.response.status})`);
    }
    if (isAxiosError(err)) {
      const body = err.response?.data as
        | { message?: string | string[] }
        | undefined;
      if (body?.message) {
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message,
        );
      }
    }
    throw err instanceof Error ? err : new Error("Could not load MOM.");
  }
}

/** Multipart `POST /specs/generate` — do not set JSON Content-Type (boundary required). */
export async function generateSpec(
  form: FormData,
): Promise<GenerateSpecResponseDto> {
  const { data } = await api.post<GenerateSpecResponseDto>(
    "/specs/generate",
    form,
    {
      transformRequest: (body, headers) => {
        if (body instanceof FormData) {
          delete headers["Content-Type"];
        }
        return body;
      },
    },
  );
  return data;
}

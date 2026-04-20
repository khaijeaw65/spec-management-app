import type {
  CreateTemplateDto,
  TemplateDetailDto,
  TemplateDto,
  UpdateTemplateDto,
} from "@spec-app/schemas";

import { api } from "@/lib/api/client";

export async function getUserTemplates(): Promise<TemplateDto[]> {
  const { data } = await api.get<TemplateDto[]>("/templates/user");
  return data;
}

export async function getTemplateById(id: string): Promise<TemplateDetailDto> {
  const { data } = await api.get<TemplateDetailDto>(`/templates/${id}`);
  return data;
}

export async function createTemplate(
  body: CreateTemplateDto,
): Promise<TemplateDetailDto> {
  const { data } = await api.post<TemplateDetailDto>("/templates", body);
  return data;
}

export async function updateTemplate(
  mainTemplateId: string,
  body: UpdateTemplateDto,
): Promise<TemplateDetailDto> {
  const { data } = await api.patch<TemplateDetailDto>(
    `/templates/${mainTemplateId}`,
    body,
  );
  return data;
}

export async function deleteTemplate(mainTemplateId: string): Promise<void> {
  await api.delete(`/templates/${mainTemplateId}`);
}

import type { TemplateFormDto } from "@spec-app/schemas";
import { notFound } from "next/navigation";

import { TemplateForm } from "@/components/templates/template-form";
import { getTemplateDetail } from "@/mocks/template.mock";

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const detail = getTemplateDetail(id);
  if (!detail) notFound();

  const defaultValues: TemplateFormDto = {
    name: detail.name,
    language: detail.language,
    sections: detail.sections.map((s) => ({ ...s })),
  };

  return <TemplateForm mode="edit" defaultValues={defaultValues} />;
}

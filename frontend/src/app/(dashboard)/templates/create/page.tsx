import { randomUUID } from "crypto";

import type { TemplateDetailDto } from "@spec-app/schemas";

import { TemplateForm } from "@/components/templates/template-form";

const CREATE_DEFAULTS: TemplateDetailDto = {
  id: randomUUID(),
  versionId: randomUUID(),
  name: "",
  description: "",
  language: "EN",
  sections: [{ title: "", description: "", order: 0 }],
};

export default function CreateTemplatePage() {
  return <TemplateForm mode="create" defaultValues={CREATE_DEFAULTS} />;
}

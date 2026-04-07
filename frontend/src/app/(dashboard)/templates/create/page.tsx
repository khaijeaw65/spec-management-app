import type { TemplateFormDto } from "@spec-app/schemas";

import { TemplateForm } from "@/components/templates/template-form";

const CREATE_DEFAULTS: TemplateFormDto = {
  name: "",
  language: "en",
  sections: [{ title: "", description: "" }],
};

export default function CreateTemplatePage() {
  return <TemplateForm mode="create" defaultValues={CREATE_DEFAULTS} />;
}

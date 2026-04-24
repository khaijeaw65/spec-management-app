import type { SpecLanguage } from "@/types/spec.types";
import type { TemplateListItem } from "@/types/template.types";

export type TemplateSectionDraft = {
  title: string;
  description: string;
};

export type TemplateDetail = {
  id: string;
  name: string;
  /** One-line blurb for template picker UIs. */
  shortDescription: string;
  language: SpecLanguage;
  createdAt: string;
  sections: TemplateSectionDraft[];
};

function sectionRows(
  count: number,
  label: string,
): TemplateSectionDraft[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `${label} — part ${i + 1}`,
    description:
      "Describe what AI should extract for this section — used as guidance for AI generation.",
  }));
}

export const TEMPLATE_ORDER = [
  "tmpl-standard",
  "tmpl-mobile",
  "tmpl-api",
  "tmpl-uiux",
] as const;

export const TEMPLATE_DETAILS: Record<string, TemplateDetail> = {
  "tmpl-standard": {
    id: "tmpl-standard",
    name: "Standard Template",
    shortDescription: "General project specification template",
    language: "EN",
    createdAt: "2024-01-12T09:00:00.000Z",
    sections: sectionRows(8, "Standard"),
  },
  "tmpl-mobile": {
    id: "tmpl-mobile",
    name: "Mobile App Template",
    shortDescription: "Optimized for mobile application specifications",
    language: "TH",
    createdAt: "2024-02-03T14:20:00.000Z",
    sections: sectionRows(10, "Mobile"),
  },
  "tmpl-api": {
    id: "tmpl-api",
    name: "API Template",
    shortDescription: "For API and integration specifications",
    language: "EN",
    createdAt: "2024-02-18T11:45:00.000Z",
    sections: sectionRows(9, "API"),
  },
  "tmpl-uiux": {
    id: "tmpl-uiux",
    name: "UI/UX Template",
    shortDescription: "Focused on user interface and experience specs",
    language: "EN",
    createdAt: "2024-03-01T08:30:00.000Z",
    sections: sectionRows(11, "UI/UX"),
  },
};

export const MOCK_TEMPLATES: TemplateListItem[] = TEMPLATE_ORDER.map(
  (id) => {
    const d = TEMPLATE_DETAILS[id];
    return {
      id: d.id,
      name: d.name,
      language: d.language,
      sectionCount: d.sections.length,
      createdAt: d.createdAt,
    };
  },
);

export function getTemplateDetail(id: string): TemplateDetail | null {
  return TEMPLATE_DETAILS[id] ?? null;
}

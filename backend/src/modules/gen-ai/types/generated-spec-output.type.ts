export interface GeneratedSpecOutputSection {
  sectionName: string;
  content: string | null;
}

export interface GeneratedSpecOutputRisk {
  code: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  sectionName: string | null;
  detail: string;
  referenceText: string | null;
}

/**
 * Expected JSON structure in `LlmResponse.text` returned by spec generation.
 */
export interface GeneratedSpecOutput {
  sections: GeneratedSpecOutputSection[];
  risks: GeneratedSpecOutputRisk[];
}

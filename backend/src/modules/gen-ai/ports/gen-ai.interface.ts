import { LlmUsage } from './llm-client.interface';

export interface Section {
  title: string;
  description: string;
  order: number;
}

export abstract class IGenAiService {
  abstract generateSpec(
    momS3Key: string,
    sections: Section[],
    language: string,
  ): Promise<{
    text: string;
    llmUsage: LlmUsage | null;
  }>;
}

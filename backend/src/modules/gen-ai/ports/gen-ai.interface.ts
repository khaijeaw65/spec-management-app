import { LlmResponse } from './llm-client.interface';

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface Risk {
  id: string;
  name: string;
}

export abstract class IGenAiService {
  abstract generateSpec(
    momS3Key: string,
    sections: Section[],
    risks: Risk[],
    language: string,
  ): Promise<LlmResponse>;
}

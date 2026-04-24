// in port or shared types
export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LlmResponse {
  text: string;
  model: string;
  usage: LlmUsage | null;
}

export abstract class ILlmClient {
  abstract generateText(input: {
    system?: string;
    prompt: string;
    temperature?: number;
    json?: boolean;
  }): Promise<LlmResponse>;
}

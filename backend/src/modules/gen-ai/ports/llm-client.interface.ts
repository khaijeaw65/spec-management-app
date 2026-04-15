// in port or shared types
export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export abstract class ILlmClient {
  abstract generateText(input: {
    system?: string;
    prompt: string;
    model?: string;
    temperature?: number;
    json?: boolean;
  }): Promise<{
    text: string;
    usage: LlmUsage | null;
  }>;
}

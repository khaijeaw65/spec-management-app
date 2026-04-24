import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ILlmClient } from 'src/modules/gen-ai/ports/llm-client.interface';
import { GenAiConfigService } from 'src/providers/config/gen-ai/config.service';

@Injectable()
export class OpenaiLlmClientService implements ILlmClient {
  private readonly client: OpenAI;

  constructor(private readonly configService: GenAiConfigService) {
    this.client = new OpenAI({
      apiKey: configService.apiKey,
    });
  }

  async generateText(input: {
    system?: string;
    prompt: string;
    temperature?: number;
    json?: boolean;
  }) {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (input.system) {
      messages.push({ role: 'system', content: input.system });
    }

    messages.push({ role: 'user', content: input.prompt });

    const completion = await this.client.chat.completions.create({
      model: this.configService.model,
      messages,
      temperature: input.temperature,
      ...(input.json && {
        response_format: { type: 'json_object' },
      }),
    });

    return {
      text: completion.choices[0].message.content ?? '',
      model: completion.model,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens ?? 0,
            completionTokens: completion.usage.completion_tokens ?? 0,
            totalTokens: completion.usage.total_tokens ?? 0,
          }
        : null,
    };
  }
}

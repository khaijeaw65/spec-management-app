import { Injectable } from '@nestjs/common';
import { IGenAiService, Risk, Section } from './ports/gen-ai.interface';
import { ILlmClient } from './ports/llm-client.interface';
import {
  IStorageFile,
  IStorageService,
} from '../storage/ports/storage.service.interface';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { GEN_AI_SYSTEM_PROMPT } from '../../constant/gen-ai-prompt.constant';

@Injectable()
export class GenAiService implements IGenAiService {
  constructor(
    private readonly llmClient: ILlmClient,
    private readonly storageService: IStorageService,
  ) {}

  async generateSpec(
    momS3Key: string,
    sections: Section[],
    risks: Risk[],
    language: string,
  ) {
    const momContent = await this.getMOMContent(momS3Key);

    const sectionPrompt = this.buildSectionPrompt(sections);

    const riskPrompt = this.buildRiskPrompt(risks);

    const result = await this.parseSpec(
      momContent,
      sectionPrompt,
      riskPrompt,
      language,
    );

    console.log(result);

    return result;
  }

  private async getMOMContent(momS3Key: string) {
    const file = await this.storageService.getFile(momS3Key);
    return this.parseMOMContent(file);
  }

  private async parseMOMContent(file: IStorageFile) {
    if (file.contentType === 'application/pdf') {
      return this.parsePDF(file.buffer);
    }

    if (
      file.contentType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.parseWord(file.buffer);
    }

    if (file.contentType === 'text/plain') {
      return file.buffer.toString('utf-8');
    }

    throw new Error('Unsupported file type');
  }

  private async parsePDF(fileContent: Buffer) {
    const parser = new PDFParse({
      data: fileContent,
    });

    const result = await parser.getText();

    await parser.destroy();
    return result.text;
  }

  private async parseWord(fileContent: Buffer) {
    const wordContent = await mammoth.extractRawText({
      buffer: fileContent,
    });

    return wordContent.value;
  }

  private buildSectionPrompt(sections: Section[]) {
    return sections
      .map((s, i) => `${i + 1}. ${s.title}\n   Description: ${s.description}`)
      .join('\n\n');
  }

  private buildRiskPrompt(risks: Risk[]) {
    const risksPrompt = risks
      .map((r, i) => `${i + 1}. ${r.id}\n   Name: ${r.name}`)
      .join('\n\n');

    return risksPrompt;
  }

  private async parseSpec(
    momContent: string,
    sectionPrompt: string,
    riskPrompt: string,
    language: string,
  ) {
    const userPrompt = `Generate a specification document using the following template sections and MOM content.
  
  LANGUAGE: ${language}
  
  TEMPLATE SECTIONS:
  ${sectionPrompt}         ← interpolated here
  
  RISKS:
  ${riskPrompt}            ← interpolated here

  MOM CONTENT:
  ${momContent}            ← interpolated here
  
  RESPONSE FORMAT:
Respond with a JSON object in this exact structure:
{
  "sections": [
    {
      "sectionName": "string", <- must exactly match one of the template section titles above
      "content": "string or null if not mentioned in MOM"
    }
  ],
  "risks": [
    {
      "code": "AMBIGUOUS_LANGUAGE",
      "priority": "HIGH | MEDIUM | LOW",
      "sectionName": "string or null",
      "detail": "string",
      "referenceText": "string or null"
    }
  ]
}

IMPORTANT: sectionName values must exactly match the template section titles provided above.`;

    console.log('begin generate spec');

    const result = await this.llmClient.generateText({
      system: GEN_AI_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2,
      json: true,
    });

    console.log('end generate spec');

    return {
      text: result.text,
      model: result.model,
      usage: result.usage ?? null,
    };
  }
}

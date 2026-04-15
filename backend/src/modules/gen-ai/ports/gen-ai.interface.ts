export abstract class IGenAiService {
  abstract generateSpec(momS3Key: string): Promise<string>;
}

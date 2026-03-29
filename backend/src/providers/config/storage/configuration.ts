import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export default registerAs('storage', () => {
  const config = {
    provider: process.env.STORAGE_PROVIDER,
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };

  const schema = z
    .object({
      provider: z.enum(['s3', 'azure', 'gcp']),
      bucket: z.string(),
      region: z.string(),
      accessKeyId: z.string().optional(),
      secretAccessKey: z.string().optional(),
    })
    .refine(
      (data) => {
        const hasKey = Boolean(data.accessKeyId);
        const hasSecret = Boolean(data.secretAccessKey);
        return hasKey === hasSecret;
      },
      {
        message:
          'Set both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or omit both (IAM role / default chain).',
      },
    );

  const result = schema.safeParse(config);

  if (!result.success) {
    throw new Error(
      'Validate storage config error: ' + z.prettifyError(result.error),
    );
  }

  return result.data;
});

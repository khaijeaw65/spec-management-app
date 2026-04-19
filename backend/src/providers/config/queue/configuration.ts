import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export default registerAs('queue', () => {
  const config = {
    url: process.env.SQS_QUEUE_URL,
    region: process.env.SQS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };

  const schema = z.object({
    url: z.string(),
    region: z.string(),
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
  });

  const result = schema.safeParse(config);

  if (!result.success) {
    throw new Error(
      'Validate queue config error: ' + z.prettifyError(result.error),
    );
  }

  return result.data;
});

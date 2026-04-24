import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export default registerAs('gen-ai', () => {
  const config = {
    model: process.env.GEN_AI_MODEL,
    apiKey: process.env.GEN_AI_API_KEY,
  };

  const schema = z.object({
    model: z.string(),
    apiKey: z.string(),
  });

  const result = schema.safeParse(config);

  if (!result.success) {
    throw new Error(
      'Validate gen-ai config error: ' + z.prettifyError(result.error),
    );
  }

  return result.data;
});

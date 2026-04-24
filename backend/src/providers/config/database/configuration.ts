import z from 'zod';
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
  };

  const result = z
    .object({
      host: z.string(),
      port: z.coerce.number(),
      username: z.string(),
      password: z.string(),
      database: z.string(),
      schema: z.string(),
    })
    .safeParse(config);

  if (!result.success) {
    throw new Error(
      'Validate database config error: ' + z.prettifyError(result.error),
    );
  }

  return result.data;
});

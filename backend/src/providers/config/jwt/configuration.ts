import z from 'zod';
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const config = {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  };

  const result = z
    .object({
      accessTokenSecret: z.string(),
      refreshTokenSecret: z.string(),
      accessTokenExpiresIn: z.string(),
      refreshTokenExpiresIn: z.string(),
    })
    .safeParse(config);

  if (!result.success) {
    throw new Error(
      'Validate jwt config error: ' + z.prettifyError(result.error),
    );
  }

  return result.data;
});

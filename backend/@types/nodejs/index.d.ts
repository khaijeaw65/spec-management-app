/**
 * Declares known environment variables used by this app.
 * Values are always strings at runtime (see Node.js `process.env`).
 */
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: string;

      AWS_REGION?: string;
      AWS_SECRET_ID?: string;

      GEN_AI_API_KEY?: string;
      GEN_AI_MODEL?: string;

      SQS_QUEUE_URL?: string;
      SQS_REGION?: string;

      JWT_ACCESS_TOKEN_SECRET?: string;
      JWT_REFRESH_TOKEN_SECRET?: string;
      JWT_ACCESS_TOKEN_EXPIRES_IN?: string;
      JWT_REFRESH_TOKEN_EXPIRES_IN?: string;

      STORAGE_PROVIDER?: string;
      SECRET_PROVIDER?: string;

      AWS_S3_BUCKET?: string;
      /** Optional override; storage falls back to `AWS_REGION` if unset. */
      AWS_S3_REGION?: string;

      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;

      DB_HOST?: string;
      DB_PORT?: string;
      DB_USER?: string;
      DB_PASS?: string;
      DB_NAME?: string;

      REDIS_HOST?: string;
      REDIS_PORT?: string;
    }
  }
}

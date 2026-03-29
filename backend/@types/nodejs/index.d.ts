declare namespace NodeJS {
  interface ProcessEnv {
    USE_AWS_SECRET?: string;
    AWS_REGION?: string;
    AWS_SECRET_ID?: string;

    AWS_S3_BUCKET?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;

    SECRET_PROVIDER?: string;
    STORAGE_PROVIDER?: string;

    JWT_SECRET?: string;
    JWT_ACCESS_TOKEN_EXPIRES_IN?: string;
    JWT_REFRESH_TOKEN_EXPIRES_IN?: string;

    DB_HOST?: string;
    DB_PORT?: number;
    DB_USER?: string;
    DB_PASS?: string;
    DB_NAME?: string;

    REDIS_HOST?: string;
    REDIS_PORT?: string;
  }
}

import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { toJSONSchema, z } from 'zod';

export function zodToOpenapi(
  schema: z.ZodTypeAny,
  example?: unknown,
): SchemaObject {
  const jsonSchema = toJSONSchema(schema) as SchemaObject;
  if (example === undefined) {
    return jsonSchema;
  }
  return { ...jsonSchema, example } as SchemaObject;
}

/** Multipart body: Zod JSON fields plus optional `file` (binary). */
export function zodToOpenapiMultipart(
  schema: z.ZodTypeAny,
  example: Record<string, unknown>,
  fileDescription = 'Meeting minutes file. Optional when momContent is provided in the form.',
): SchemaObject {
  const base = zodToOpenapi(schema) as SchemaObject & {
    properties?: Record<string, SchemaObject>;
  };
  return {
    ...base,
    properties: {
      ...base.properties,
      file: {
        type: 'string',
        format: 'binary',
        description: fileDescription,
      },
    },
    example: { ...example },
  } as SchemaObject;
}

export function zodToOpenapiResponse(schema: z.ZodTypeAny): SchemaObject {
  return {
    type: 'object',
    properties: {
      status: { type: 'number' },
      message: { type: 'string', example: 'success' },
      data: z.toJSONSchema(schema, {
        unrepresentable: 'any',
        override: (ctx) => {
          const def = ctx.zodSchema._zod.def;
          if (def.type === 'date') {
            ctx.jsonSchema.type = 'string';
            ctx.jsonSchema.format = 'date-time';
          }
        },
      }) as SchemaObject,
    },
    required: ['status', 'message', 'data'],
  };
}

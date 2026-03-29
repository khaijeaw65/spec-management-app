import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { toJSONSchema, z } from 'zod';

export function zodToOpenapi(schema: z.ZodTypeAny) {
  const jsonSchema = toJSONSchema(schema);

  return jsonSchema as SchemaObject;
}

export function zodToOpenapiResponse(schema: z.ZodTypeAny): SchemaObject {
  return {
    type: 'object',
    properties: {
      status: { type: 'number' },
      message: { type: 'string', example: 'success' },
      data: toJSONSchema(schema) as SchemaObject,
    },
    required: ['status', 'message', 'data'],
  };
}

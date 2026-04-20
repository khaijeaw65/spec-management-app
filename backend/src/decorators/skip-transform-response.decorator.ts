// skip-transform.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const SkipTransform = () => SetMetadata('skipTransform', true);

import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './context.service';
import { IRequestContextService } from './interfaces/request.context.interface';

@Global()
@Module({
  providers: [
    RequestContextService,
    { provide: IRequestContextService, useExisting: RequestContextService },
  ],
  exports: [IRequestContextService],
})
export class RequestContextModule {}

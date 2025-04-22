import { Global, Module } from "@nestjs/common";
import { Logger } from "@nestjs/common";

import { LoggerService } from "@/modules/logger/logger.service";

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useClass: LoggerService
    }
  ],
  exports: [Logger]
})
export class LoggerModule {}

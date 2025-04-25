import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { LoggerModule } from "@/modules/logger/logger.module";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { TelegramModule } from "@/modules/telegram/telegram.module";

import { getAppConfig } from "@/config/app.config";

import { LoggingMiddleware } from "@/middlewares/logging.middleware";

@Module({
  imports: [
    ConfigModule.forRoot(getAppConfig()),
    //JwtModule,
    LoggerModule,
    PrismaModule,
    //TokensModule,
    //AuthModule,
    //UsersModule,
    //PasswordModule,
    TelegramModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "@/modules/auth/auth.module";
import { JwtModule } from "@/modules/jwt/jwt.module";
import { LoggerModule } from "@/modules/logger/logger.module";
import { PasswordModule } from "@/modules/password/password.module";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { TokensModule } from "@/modules/tokens/tokens.module";
import { UsersModule } from "@/modules/users/users.module";

import { validationSchema } from "@/config/validation-schema.config";

import { LoggingMiddleware } from "@/middlewares/logging.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
      cache: true,
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: false
      }
    }),
    JwtModule,
    LoggerModule,
    PrismaModule,
    TokensModule,
    AuthModule,
    UsersModule,
    PasswordModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
